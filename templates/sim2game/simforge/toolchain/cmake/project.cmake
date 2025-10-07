cmake_minimum_required(VERSION 3.2)

project(simforge_runtime)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -O3")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/../../distribution/runtime/wasm")
set(SIMFORGE_CORE_ROOT "${CMAKE_SOURCE_DIR}/../../core")

set(MUJOCO_INSTALL_INCLUDE_DIR ${SIMFORGE_CORE_ROOT}/include)
set(MUJOCO_INSTALL_BIN_DIR ${SIMFORGE_CORE_ROOT}/bin)
set(MUJOCO_INSTALL_LIB_DIR ${SIMFORGE_CORE_ROOT}/lib)

include_directories(${MUJOCO_INSTALL_INCLUDE_DIR})
link_directories(${MUJOCO_INSTALL_LIB_DIR})

include(${CMAKE_CURRENT_LIST_DIR}/targets/wasm-kernel.cmake)
