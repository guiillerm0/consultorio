import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        <meta name="description" content="Sistema de recetas médicas digitales seguras" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}