import { defineConfig } from 'orval'

export default defineConfig({
  nutrisense: {
    input: {
      target: '../../openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/endpoints',
      schemas: 'src/api/model',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/lib/axios.ts',
          name: 'customInstance',
        },
      },
    },
  },
})
