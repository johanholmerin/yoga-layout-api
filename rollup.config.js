import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
  input: 'yoga.js',
  output: {
    file: 'build/yoga.js',
    format: 'iife'
  },
  plugins: [
    builtins(),
    globals(),
    nodeResolve({
      browser: true
    }),
    commonjs()
  ]
};
