import { RequestHandler, createProxyMiddleware } from 'http-proxy-middleware'

export default function (app: { use: (base: string, handler: RequestHandler) => void }) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://open-bus-stride-api.hasadna.org.il',
      changeOrigin: true,
      pathRewrite: {
        '^/api/': '/', // remove base path
      },
    }),
  )
}
