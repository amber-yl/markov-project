// /v1/requests

function mockRequests(engine: string, type: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        details: 'ok',
        responseData: [
          {
            id: 'id_' + new Date().getTime(),
            user_id: 'user_id_' + new Date().getTime(),
            console_output: 'logs/' + new Date().getTime() + ' log',
            arguments: [
              {
                id: 'id1_' + new Date().getTime(),
                user_id: 'user_id1_' + new Date().getTime(),
                argument_meta_id: 'argument_meta_id_' + new Date().getTime(),
                name: 'llm',
                data: "llm",
                is_predefined: true,
                created_ts: new Date(),
                updated_ts: new Date(),
                depends_on: null,
                argument_meta: {
                  id: 'argument_meta_id1_' + new Date().getTime(),
                  engine_id: 'engine_id1_' + new Date().getTime(),
                  dtype_id: 'dtype_id1_' + new Date().getTime(),
                  show_to_user: true,
                  is_required: true,
                  order: 0,
                  engine: {
                    id: 'engine_id1_' + new Date().getTime(),
                    name: engine,
                    executable: "python run.py",
                  },
                  dtype: {
                    id: 'dtype_id1_' + new Date().getTime(),
                    name: 'command_argument',
                  }
                },
                user: {
                  id: 'user_id1_' + new Date().getTime(),
                  external_id: '-1',
                  role_id: 2,
                  display_name: 'Common Admin',
                  created_ts: new Date(),
                  updated_ts: new Date(),
                  role: {
                    id: 2,
                    name: "Admin"
                  }
                }
              },
              {
                id: 'id2_' + new Date().getTime(),
                user_id: 'user_id2_' + new Date().getTime(),
                argument_meta_id: 'argument_meta_id2_' + new Date().getTime(),
                name: 'llm',
                data: "llm",
                is_predefined: false,
                created_ts: new Date(),
                updated_ts: new Date(),
                depends_on: null,
                argument_meta: {
                  id: 'argument_meta_id2_' + new Date().getTime(),
                  engine_id: 'engine_id2_' + new Date().getTime(),
                  dtype_id: 'dtype_id2_' + new Date().getTime(),
                  show_to_user: true,
                  is_required: true,
                  order: 0,
                  engine: {
                    id: 'engine_id2_' + new Date().getTime(),
                    name: engine,
                    executable: "python run.py",
                  },
                  dtype: {
                    id: 'dtype_id2_' + new Date().getTime(),
                    name: 'json',
                  }
                },
                user: {
                  id: 'user_id2_' + new Date().getTime(),
                  external_id: '-2',
                  role_id: 1,
                  display_name: 'Common User',
                  created_ts: new Date(),
                  updated_ts: new Date(),
                  role: {
                    id: 1,
                    name: "User"
                  }
                }
              },
              {
                id: 'id3_' + new Date().getTime(),
                user_id: 'user_id3_' + new Date().getTime(),
                argument_meta_id: 'argument_meta_id3_' + new Date().getTime(),
                name: 'llm',
                data: "llm",
                is_predefined: false,
                created_ts: new Date(),
                updated_ts: new Date(),
                depends_on: null,
                argument_meta: {
                  id: 'argument_meta_id3_' + new Date().getTime(),
                  engine_id: 'engine_id3_' + new Date().getTime(),
                  dtype_id: 'dtype_id3_' + new Date().getTime(),
                  show_to_user: true,
                  is_required: true,
                  order: 0,
                  engine: {
                    id: 'engine_id3_' + new Date().getTime(),
                    name: engine,
                    executable: "python run.py",
                  },
                  dtype: {
                    id: 'dtype_id3_' + new Date().getTime(),
                    name: 'json',
                  }
                },
                user: {
                  id: 'user_id3_' + new Date().getTime(),
                  external_id: '-2',
                  role_id: 1,
                  display_name: 'Common User',
                  created_ts: new Date(),
                  updated_ts: new Date(),
                  role: {
                    id: 1,
                    name: "User"
                  }
                }
              },
              {
                id: 'id4_' + new Date().getTime(),
                user_id: 'user_id4_' + new Date().getTime(),
                argument_meta_id: 'argument_meta_id4_' + new Date().getTime(),
                name: 'llm',
                data: "llm",
                is_predefined: false,
                created_ts: new Date(),
                updated_ts: new Date(),
                depends_on: null,
                argument_meta: {
                  id: 'argument_meta_id4_' + new Date().getTime(),
                  engine_id: 'engine_id4_' + new Date().getTime(),
                  dtype_id: 'dtype_id4_' + new Date().getTime(),
                  show_to_user: true,
                  is_required: true,
                  order: 0,
                  engine: {
                    id: 'engine_id4_' + new Date().getTime(),
                    name: engine,
                    executable: "python run.py",
                  },
                  dtype: {
                    id: 'dtype_id4_' + new Date().getTime(),
                    name: 'json',
                  }
                },
                user: {
                  id: 'user_id4_' + new Date().getTime(),
                  external_id: '-2',
                  role_id: 1,
                  display_name: 'Common User',
                  created_ts: new Date(),
                  updated_ts: new Date(),
                  role: {
                    id: 1,
                    name: "User"
                  }
                }
              }
            ],
            engine: {
              id: 'engine_id_' + new Date().getTime(),
              name: engine,
              executable: "python run.py",
            },
            name: 'Inference Eval Test',
            output: 'jsons/' + new Date().getTime() + 'json',
            parent: null,
            removed: false,
            root: 'root_' + new Date().getTime(),
            status: 'Done',
            type: 'inference',
            updated_at: new Date().getTime(),
            tags: null,
            status_comment: '',
            created_ts: new Date(),
            updated_ts: new Date(),
            user: {
              id: 'user_id_' + new Date().getTime(),
              external_id: '-2',
              role_id: 1,
              display_name: 'Common User',
              created_ts: new Date(),
              updated_ts: new Date(),
              role: {
                id: 1,
                name: "User"
              }
            }
          }
        ],
        succeed: true,
      })
    }, 500)
  })
}