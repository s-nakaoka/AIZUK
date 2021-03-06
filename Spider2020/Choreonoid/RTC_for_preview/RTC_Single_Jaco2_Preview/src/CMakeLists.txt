set(comp_srcs RTC_Single_Jaco2_Preview.cpp
              io_wrapper/ArmAngularWrapper.cpp
              io_wrapper/FingerStatusWrapper.cpp
    )
set(standalone_srcs RTC_Single_Jaco2_PreviewComp.cpp)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")

find_package(PkgConfig)
pkg_check_modules(CHOREONOID REQUIRED choreonoid)

if(${OPENRTM_VERSION_MAJOR} LESS 2)
  set(OPENRTM_CFLAGS ${OPENRTM_CFLAGS} ${OMNIORB_CFLAGS})
  set(OPENRTM_INCLUDE_DIRS ${OPENRTM_INCLUDE_DIRS} ${OMNIORB_INCLUDE_DIRS})
  set(OPENRTM_LIBRARY_DIRS ${OPENRTM_LIBRARY_DIRS} ${OMNIORB_LIBRARY_DIRS})
endif()

if (DEFINED OPENRTM_INCLUDE_DIRS)
  string(REGEX REPLACE "-I" ";"
    OPENRTM_INCLUDE_DIRS "${OPENRTM_INCLUDE_DIRS}")
  string(REGEX REPLACE " ;" ";"
    OPENRTM_INCLUDE_DIRS "${OPENRTM_INCLUDE_DIRS}")
endif (DEFINED OPENRTM_INCLUDE_DIRS)

if (DEFINED OPENRTM_LIBRARY_DIRS)
  string(REGEX REPLACE "-L" ";"
    OPENRTM_LIBRARY_DIRS "${OPENRTM_LIBRARY_DIRS}")
  string(REGEX REPLACE " ;" ";"
    OPENRTM_LIBRARY_DIRS "${OPENRTM_LIBRARY_DIRS}")
endif (DEFINED OPENRTM_LIBRARY_DIRS)

if (DEFINED OPENRTM_LIBRARIES)
  string(REGEX REPLACE "-l" ";"
    OPENRTM_LIBRARIES "${OPENRTM_LIBRARIES}")
  string(REGEX REPLACE " ;" ";"
    OPENRTM_LIBRARIES "${OPENRTM_LIBRARIES}")
endif (DEFINED OPENRTM_LIBRARIES)

include_directories(${CHOREONOID_INCLUDE_DIRS})
include_directories(${PROJECT_SOURCE_DIR}/include)
include_directories(${PROJECT_SOURCE_DIR}/include/${PROJECT_NAME})
include_directories(${PROJECT_SOURCE_DIR}/include/${PROJECT_NAME}/io_wrapper)
include_directories(${PROJECT_BINARY_DIR})
include_directories(${PROJECT_BINARY_DIR}/idl)
include_directories(${OPENRTM_INCLUDE_DIRS})
add_definitions(${OPENRTM_CFLAGS})

MAP_ADD_STR(comp_hdrs "../" comp_headers)

link_directories(${CHOREONOID_LIBRARY_DIRS})
link_directories(${OPENRTM_LIBRARY_DIRS})

add_library(${PROJECT_NAME} ${LIB_TYPE} ${comp_srcs}
  ${comp_headers} ${ALL_IDL_SRCS})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "")
set_source_files_properties(${ALL_IDL_SRCS} PROPERTIES GENERATED 1)
if(NOT TARGET ALL_IDL_TGT)
 add_custom_target(ALL_IDL_TGT)
endif(NOT TARGET ALL_IDL_TGT)
add_dependencies(${PROJECT_NAME} ALL_IDL_TGT)
target_link_libraries(${PROJECT_NAME} ${OPENRTM_LIBRARIES})
target_link_libraries(${PROJECT_NAME} CnoidBase)
target_link_libraries(${PROJECT_NAME} CnoidBody)
target_link_libraries(${PROJECT_NAME} CnoidBodyIoRTC)
target_link_libraries(${PROJECT_NAME} CnoidOpenRTM)
target_link_libraries(${PROJECT_NAME} CnoidUtil)

add_executable(${PROJECT_NAME}Comp ${standalone_srcs}
  ${comp_srcs} ${comp_headers} ${ALL_IDL_SRCS})
add_dependencies(${PROJECT_NAME}Comp ALL_IDL_TGT)
target_link_libraries(${PROJECT_NAME}Comp ${OPENRTM_LIBRARIES})
target_link_libraries(${PROJECT_NAME}Comp CnoidBase)
target_link_libraries(${PROJECT_NAME}Comp CnoidBody)
target_link_libraries(${PROJECT_NAME}Comp CnoidBodyIoRTC)
target_link_libraries(${PROJECT_NAME}Comp CnoidOpenRTM)
target_link_libraries(${PROJECT_NAME}Comp CnoidUtil)


install(TARGETS ${PROJECT_NAME} ${PROJECT_NAME}Comp
    EXPORT ${PROJECT_NAME}
    RUNTIME DESTINATION ${INSTALL_PREFIX} COMPONENT component
    LIBRARY DESTINATION ${INSTALL_PREFIX} COMPONENT component
    ARCHIVE DESTINATION ${INSTALL_PREFIX} COMPONENT component)

install(FILES ${PROJECT_SOURCE_DIR}/RTC.xml DESTINATION ${INSTALL_PREFIX}
        COMPONENT component)
