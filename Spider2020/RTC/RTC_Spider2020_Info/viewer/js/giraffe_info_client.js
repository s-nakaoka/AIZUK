/**
 * WebSocket データ受信時に実行されるコールバック関数
 * @callback GiraffeInfoClient~onReceivedCallback
 * @param {String} port RTC 入力ポート名
 * @param {Object} input 入力時刻・データ
 * @param {Number} input.tm 時刻
 * @param {Number|Object} input.data データ
 * @param {Object} lastInput 前回の入力時刻・データ
 * @param {Number} lastInput.tm 時刻
 * @param {Number|Object} lastInput.data データ
 */

 var $s; // スタティック変数参照用
 
 /** GiraffeInfo RTC に WebSocket で接続しデータ受信を行うクラス */
export class GiraffeInfoClient {

 	/**
     * @param  {String} webSocketUrl 接続先 WebSocket URL
     * @param  {Object}   callbacks コールバック関数
	 * @param  {function} callbacks.onConnect 接続開始時に実行
	 * @param  {function} callbacks.onConnected 接続完了時に実行
	 * @param  {function} callbacks.onDisconnected 切断時に実行
	 * @param  {function} callbacks.onReconnect 再接続開始時に実行
	 * @param  {GiraffeInfoClient~onReceivedCallback} callbacks.onReceived データ受信時に実行
     * @param  {Object}  options={} オプション
	 * @param  {Boolean} options.debug デバッグモード、true で有効、false で無効
     */
    constructor(webSocketUrl, callbacks, options = {}) {
		$s = this.constructor; // スタティック変数参照用

		this.webSocketUrl = webSocketUrl;
		this.callbacks = callbacks;
		this.options = $.extend({
            debug: false,
        }, options);

        this.lastInput = {};
        this.started = false;
    }
	
    /**
     * WebSocket サーバーに接続し、データ受信を開始する。
     * @return {Boolean} 正常に開始した場合は true、既に開始している場合は false
     */
    start() {
        if (this.started) return false;

        this._call(this.callbacks.onConnect);
		this._openWebSocket();

		setTimeout(() => {
			setInterval(() => this._reopenWebSocket(), 1000)
		}, 1000);

        this.started = true;

        return true;
    }

	/**
	 * data を受信した際の処理を実行する。主にデバッグ用。
	 * @param {Object} data 受信データ (ダミー)
	 */
	data(data) {
        this._callDataHandler(data);
    }

	/**
	 * コールバック関数 callback が定義されていれば実行する。
	 * @private
	 * @param {function} callback コールバック関数
	 * @param  {...any} args コールバック関数の引数
	 * @return {*} コールバック関数の戻り値
	 */
	 _call(callback, ...args) {
		if (callback) return callback.apply(this, args);
	}

	/**
	 * WebSocket サーバーへの接続を開始する。
	 * @private
	 */
	_openWebSocket() {
		this.ws = new WebSocket(this.webSocketUrl);
		this.ws.onopen = (e) => {
			this._call(this.callbacks.onConnected);
			this.ws.onmessage = (e) => {
				var data = JSON.parse(e.data)
				this._callDataHandler(data);
			};
			this.ws.onclose = (e) => {
				this._call(this.callbacks.onDisconnected);
			};
		};
	}

	/**
	 * WebSocket サーバーへの接続が切れている場合に再接続を行う。
	 * @private
	 */
	_reopenWebSocket() {
		if (this.ws.readyState == WebSocket.CLOSED) {
			this._call(this.callbacks.onReconnect);
			this._openWebSocket();
		}
	}

	/**
	 * データ受信時にコールバック関数 onReceived を実行する。
	 * @see GiraffeInfoClient~onReceivedCallback
	 * @private
	 * @param {Object} data 受信データ
	 */
    _callDataHandler(data) {
		if (this.options.debug)	console.log(JSON.stringify(data));
		$.each(data, (port, input) => {
			if (input != null) {
				this._call(this.callbacks.onReceived, port, input, this.lastInput[port]);
				this.lastInput[port] = input;
			}
		});
	}

}