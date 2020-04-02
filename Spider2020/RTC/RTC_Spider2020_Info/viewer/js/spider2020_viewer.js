import {GiraffeViewer} from "./giraffe_viewer.js";
import {Spider2020ViewerConfig} from "./spider2020_viewer_config.js";

var $s;

/** GiraffeViewer アプリケーション クラス */
export class Spider2020Viewer extends GiraffeViewer {

	/** コンストラクタ */
	constructor() {
		super();
		$s = this.constructor; // スタティック変数参照用
	}

	/**
	 * 各 RTC 入力ポートに対応する初期化関数を定義する。
	 * @private
	 */
	_definePortInitializer() {
		var init = super._definePortInitializer();

		// initialize Arm1Pose3D_In
		init.Arm1Pose3D_In = (port, params) => {
			this._setDebugEditValue(port, {position: {x: 0, y: 0, z:0}, orientation: {r: 0, p: 0, y: 0}});
		};

		// initialize Arm1Angular_In
		init.Arm1Angular_In = (port, params) => {
			this._setDebugEditValue(port, [0, 0, 0, 0, 0, 0]);
		};

		// initialize Arm1Finger_In
		init.Arm1Finger_In = (port, params) => {
			this._setDebugEditValue(port, [0, 0, 0]);
		};

		// initialize Arm1Current_In
		init.Arm1Current_In = (port, params) => {
			this._setDebugEditValue(port, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
		};

		return init;
	}

	/**
	 * 各 RTC 入力ポートに対応する受信データ処理関数を定義する。
	 * @private
	 */
	_defineDataHandlers() {
		var handlers = super._defineDataHandlers();

		// data handler Arm1Pose3D_In
		handlers.Arm1Pose3D_In = (port, data, params) => {
			$.each(data.position, (axis, value) => {
				params.panel.find(".position .data."+axis).text($.sprintf("%.3f", value));
			})
			$.each(data.orientation, (axis, rad) => {
				params.panel.find(".orientation."+axis+" .data").text($.sprintf("%.1f", this._angle(rad, 0.1)));
			})
		};

		// data handler Arm1Angular_In
		handlers.Arm1Angular_In = (port, data, params) => {
			$.each(data, (i, rad) => {
				params.panel.find(".angular.arm .data.axis"+(i+1)).text($.sprintf("%.1f", this._angle(rad, 0.1)));
			});
		};

		// data handler Arm1Finger_In
		handlers.Arm1Finger_In = (port, data, params) => {
			$.each(data, (i, u) => {
				params.panel.find(".angular.finger .data.finger"+(i+1)).text($.sprintf("%d", u));
			});
		};

		// data handler Arm1Current_In
		handlers.Arm1Current_In = (port, data, params) => {
			$.each(data, (i, value) => {
				params.panel.find(".current .data.current"+(i+1)).text($.sprintf("%.3f", value));
			});
		};

		return handlers;
	}

	/**
	 * デバッグデータを生成する。
	 * @private
	 * @param {Number} interval=100 生成間隔
	 */
	_generateDebugData(interval = 100) {
		setInterval(() => {
			$.each({
				MainCapacityRatio_In: 0,
				Mode_In: [0 ,0 ,0 ,0 ,0 ,0],
				Pose3D_In: {position: {x: 0, y: 0, z:0}, orientation: {r: 0, p: 0, y: 0}},
				Velocity2D_In: {vx: 0, vy: 0, va: 0},
				FlipperAngle_In: [0 ,0 ,0 ,0],
				MotorLoad_In: [0 ,0 ,0 ,0 ,0 ,0],
				GCCapacityRatio_In: 0,
				Arm1Pose3D_In: {position: {x: 0, y: 0, z:0}, orientation: {r: 0, p: 0, y: 0}},
				Arm1Angular_In:	[0 ,0 ,0 ,0 ,0 ,0],
				Arm1Finger_In: [0, 0, 0],
				Arm1Current_In:	[0 ,0 ,0 ,0 ,0 ,0, 0, 0, 0],
			}, (port, data) => {
				var date = new Date();
				var time = (date.getTime() + date.getMilliseconds()) / 1000;
				this.info.data({[port]: {tm: time, data: data}});
			});
		}, interval);
	}
}

Object.assign(Spider2020Viewer, Spider2020ViewerConfig);