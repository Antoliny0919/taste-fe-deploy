import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (_env, argv) => {
  const mode = argv.mode ?? 'development';

  // babel-loader는 webpack의 --mode가 아니라 NODE_ENV(BABEL_ENV)로 dev/prod를 판단한다.
  // 이걸 맞춰주지 않으면 production 빌드인데도 babel이 jsxDEV(개발용 JSX 런타임) 호출을
  // 뱉고, 정작 React는 DefinePlugin 때문에 production 런타임으로 잡힌다.
  // → react/cjs/react-jsx-dev-runtime.production.js 의 jsxDEV는 void 0 이라
  //   "(0 , a.jsxDEV) is not a function" 으로 렌더가 통째로 죽고 빈 화면이 뜬다.
  process.env.NODE_ENV = process.env.NODE_ENV ?? mode;
  process.env.BABEL_ENV = process.env.BABEL_ENV ?? mode;

  return {
    entry: './main.tsx',
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    output: {
      // [contenthash] = 파일 내용이 바뀔 때만 파일명이 바뀐다.
      // 배포 캐싱 전략(s3/README.md, ec2/README.md)의 전제가 되는 설정.
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        inject: true,
      }),
      // 빌드 시점 정보를 번들에 박아 넣는다. "지금 보고 있는 화면이 방금 배포한 그것인가"를
      // 눈으로 확인하기 위한 POC의 핵심 장치.
      new webpack.DefinePlugin({
        __BUILD_INFO__: JSON.stringify({
          commit: (process.env.GITHUB_SHA ?? 'local').slice(0, 7),
          builtAt: new Date().toISOString(),
          target: process.env.DEPLOY_TARGET ?? 'local',
        }),
        // S3 버전: 백엔드가 다른 도메인 → 절대 URL 주입
        // EC2 버전: nginx가 같은 도메인에서 프록시 → '/api'
        __API_BASE__: JSON.stringify(process.env.API_BASE ?? '/api'),
      }),
    ],
    devServer: {
      static: [{ directory: path.join(__dirname, 'dist') }],
      port: 3005,
      open: true,
      hot: true,
      historyApiFallback: true,
    },
  };
};
