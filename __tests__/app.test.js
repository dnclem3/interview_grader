import React from 'react';
import ReactDOM from 'react-dom';

global.React = React;
global.ReactDOM = ReactDOM;

document.body.innerHTML = '<div id="root"></div>';

// Require the script after setting globals so it can access React and ReactDOM
const { App, questionBank } = require('../docs/script.js');

it('question bank is an object with categories', () => {
  expect(typeof questionBank).toBe('object');
  expect(Object.keys(questionBank).length).toBeGreaterThan(0);
});

it('App renders without crashing', () => {
  const div = document.createElement('div');
  expect(() => {
    ReactDOM.render(<App />, div);
  }).not.toThrow();
});
