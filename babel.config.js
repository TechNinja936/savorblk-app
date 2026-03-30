module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@stores': './src/stores',
            '@hooks': './src/hooks',
            '@theme': './src/theme',
            '@lib': './src/lib',
            '@utils': './src/utils',
            '@navigation': './src/navigation',
            '@types': './src/types',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}
