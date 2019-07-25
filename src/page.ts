// page renderer script

import 'bootstrap3/dist/css/bootstrap.min.css';
import './mermaid.css';
import './style.css';

import * as mermaid from 'mermaid';
import * as flowchart from 'flowchart.js';
import 'js-sequence-diagrams';
import * as S from 'string';

const mermaids = $('span.mermaid.raw');
mermaids.removeClass('raw')
mermaids.each((key, value) => {
  try {
    var $value = $(value)
    var $ele = $(value).closest('pre')

    mermaid.parse($value.text())
    $ele.addClass('mermaid')
    $ele.html($value.text())
    mermaid.init(undefined, $ele)
  } catch (err) {
    // $value.unwrap()
    // $value.parent().append(`<div class="alert alert-warning">${S(err.str).escapeHTML().s}</div>`)
    // console.warn(err)
    // console.log($value.text())
    $ele.addClass('mermaid')
  }
})

const flows = $('span.flow-chart.raw')
flows.removeClass('raw')
flows.each((key, value) => {
  try {
    var $value = $(value)
    var $ele = $(value).parent().parent()

    const chart = flowchart.parse($value.text())
    $value.html('')
    chart.drawSVG(value, {
      'line-width': 2,
      'fill': 'none',
      'font-size': '16px',
      'font-family': "'Andale Mono', monospace"
    })
    $ele.addClass('flow-chart')
    $value.children().unwrap().unwrap()
  } catch (err) {
    // $value.unwrap()
    // $value.parent().append(`<div class="alert alert-warning">${S(err).escapeHTML().s}</div>`)
    // console.warn(err)
    $ele.addClass('flow-chart')
  }
})

const sequences = $('span.sequence-diagram.raw')
sequences.removeClass('raw')
sequences.each((key, value) => {
  try {
    var $value = $(value)
    var $ele = $(value).parent().parent()

    const sequence = $value as any
    sequence.sequenceDiagram({
      theme: 'simple'
    })

    $ele.addClass('sequence-diagram')
    $value.children().unwrap().unwrap()
    const svg = $ele.find('> svg')
    svg[0].setAttribute('viewBox', `0 0 ${svg.attr('width')} ${svg.attr('height')}`)
    svg[0].setAttribute('preserveAspectRatio', 'xMidYMid meet')
  } catch (err) {
    // $value.unwrap()
    // $value.parent().append(`<div class="alert alert-warning">${S(err).escapeHTML().s}</div>`)
    // console.warn(err)
    $ele.addClass('sequence-diagram')
  }
})
