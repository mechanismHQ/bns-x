import React from 'react';
import type { DocumentContext } from 'next/document';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import { darkMode, allCss } from '../common/theme';

export default class Document extends NextDocument {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await NextDocument.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          <style id="stitches" dangerouslySetInnerHTML={{ __html: allCss() }} />
        </>
      ),
    };
  }
  render() {
    return (
      <Html lang="en" className={darkMode}>
        <Head>
          <style id="stitches" dangerouslySetInnerHTML={{ __html: allCss() }} />
          <style
            dangerouslySetInnerHTML={{
              __html: `
            html.dark-mode {
              background-color: var(--colors-surface-surface);
            }
          `,
            }}
          ></style>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />
          <link
            rel="preload"
            href="/fonts/OpenSauce/OpenSauceSans-Medium.ttf"
            as="font"
            crossOrigin=""
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
