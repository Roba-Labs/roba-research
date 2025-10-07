set(SIMFORGE_WASM_SOURCES
    ${SIMFORGE_CORE_ROOT}/generated/kernel.compiled.cc
)

add_compile_options(-pthread)
set(EMCC_LINKER_FLAGS "-s ASSERTIONS=1 --bind -s ALLOW_MEMORY_GROWTH=1 -s EXPORT_ES6=1 -s MODULARIZE=1 -s FORCE_FILESYSTEM=1 -s EXPORTED_RUNTIME_METHODS=['FS','MEMFS'] -s EXPORT_NAME=load_mujoco -s EXCEPTION_CATCHING_ALLOWED=['load_from_xml']")
set(CMAKE_REQUIRED_FLAGS "${EMCC_LINKER_FLAGS}")

add_executable(simforge_runtime ${SIMFORGE_WASM_SOURCES})
set_target_properties(simforge_runtime PROPERTIES
    OUTPUT_NAME "simforge-runtime"
    LINK_FLAGS "${EMCC_LINKER_FLAGS}"
)

target_link_libraries(simforge_runtime
    ccd
    elasticity
    lodepng
    mujoco
    tinyxml2
    qhullstatic_r
)
