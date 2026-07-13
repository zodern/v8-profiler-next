{
  'variables': {
    # Needed for Node 14
    'openssl_fips': ''
  },
  'targets': [
    {
      'target_name': 'profiler',
      'win_delay_load_hook': 'false',
      'sources': [
        'src/cpu_profiler/cpu_profiler.cc',
        'src/cpu_profiler/cpu_profile.cc',
        'src/cpu_profiler/cpu_profile_node.cc',
        'src/heap_profiler/sampling_heap_profiler.cc',
        'src/heapsnapshot/heap_profiler.cc',
        'src/heapsnapshot/heap_snapshot.cc',
        'src/heapsnapshot/heap_output_stream.cc',
        'src/heapsnapshot/heap_graph_node.cc',
        'src/heapsnapshot/heap_graph_edge.cc',
        'src/profiler.cc',
        'src/environment_data.cc'
      ],
      'include_dirs' : [
        'src',
        '<!(node -e "require(\'nan\')")'
      ],
      'conditions':[
        ['OS == "linux"', {
          'cflags': [
            '-O2',
            '-std=c++20',
            '-Wno-sign-compare',
            '-Wno-cast-function-type'
          ]
        }],
        ['OS == "mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'OTHER_CFLAGS': [
              '-std=c++20',
              '-Wconversion',
              '-Wno-sign-conversion'
            ]
          }
        }],
        ['OS == "win"', {
          # Remove clang-only options Node used
          'configurations': {
            'Release': {
              'msvs_settings': {
                'VCCLCompilerTool': {
                  'AdditionalOptions/': [ ['exclude', '-flto|lldltojobs'] ]
                },
                'VCLibrarianTool': {
                  'AdditionalOptions/': [ ['exclude', '-flto|lldltojobs'] ]
                },
                'VCLinkerTool': {
                  'AdditionalOptions/': [ ['exclude', '-flto|lldltojobs'] ]
                }
              }
            }
          }
        }]
      ]
    }
  ]
}
