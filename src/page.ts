// page renderer script

import 'bootstrap3/dist/css/bootstrap.min.css';
import './mermaid.css';
import './github-gist.css';
import 'prismjs/themes/prism.css';
import 'katex/dist/katex.css';

import './markdown.css';
import './style.css';
import './font-awesome.min.css';

import * as mermaid from 'mermaid';
import * as flowchart from 'flowchart.js';
import * as abcjs from 'abcjs';
import * as katex from 'katex';

import 'js-sequence-diagrams';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
import * as S from 'string';

const mermaids = $('span.mermaid.raw');
mermaids.removeClass('raw');
mermaids.each((key, value) => {
  try {
    var $value = $(value);
    var $ele = $(value).closest('pre');

    mermaid.parse($value.text());
    $ele.addClass('mermaid');
    $ele.html($value.text());
    mermaid.init(undefined, $ele);
  } catch (err) {
    // $value.unwrap()
    // $value.parent().append(`<div class="alert alert-warning">${S(err.str).escapeHTML().s}</div>`)
    // console.warn(err)
    // console.log($value.text())
    $ele.addClass('mermaid');
  }
});

const flows = $('span.flow-chart.raw');
flows.removeClass('raw');
flows.each((key, value) => {
  try {
    var $value = $(value);
    var $ele = $(value)
      .parent()
      .parent();

    const chart = flowchart.parse($value.text());
    $value.html('');
    chart.drawSVG(value, {
      'line-width': 2,
      fill: 'none',
      'font-size': '16px',
      'font-family': "'Andale Mono', monospace",
    });
    $ele.addClass('flow-chart');
    $value
      .children()
      .unwrap()
      .unwrap();
  } catch (err) {
    // $value.unwrap()
    // $value.parent().append(`<div class="alert alert-warning">${S(err).escapeHTML().s}</div>`)
    // console.warn(err)
    $ele.addClass('flow-chart');
  }
});

const sequences = $('span.sequence-diagram.raw');
sequences.removeClass('raw');
sequences.each((key, value) => {
  try {
    var $value = $(value);
    var $ele = $(value)
      .parent()
      .parent();

    const sequence = $value as any;
    sequence.sequenceDiagram({
      theme: 'simple',
    });

    $ele.addClass('sequence-diagram');
    $value
      .children()
      .unwrap()
      .unwrap();
    const svg = $ele.find('> svg');
    svg[0].setAttribute(
      'viewBox',
      `0 0 ${svg.attr('width')} ${svg.attr('height')}`,
    );
    svg[0].setAttribute('preserveAspectRatio', 'xMidYMid meet');
  } catch (err) {
    // $value.unwrap()
    // $value.parent().append(`<div class="alert alert-warning">${S(err).escapeHTML().s}</div>`)
    // console.warn(err)
    $ele.addClass('sequence-diagram');
  }
});

let viz = new Viz({ Module, render });

const graphvizs = $('span.graphviz.raw');
graphvizs.removeClass('raw');
graphvizs.each(function(key, value) {
  try {
    var $value = $(value);
    var $ele = $(value)
      .parent()
      .parent();
    $value.unwrap();
    const option = {
      engine: $value.attr('data-engine') || undefined,
    };
    viz
      .renderString($value.text(), option)
      .then(result => {
        if (!result) {
          throw Error('viz.js output empty graph');
        }
        $value.html(result);
        $ele.addClass('graphviz');
        $value.children().unwrap();
      })
      .catch(err => {
        viz = new Viz({ Module, render });

        // $value.parent().append(`<div class="alert alert-warning">${S(err).escapeHTML().s}</div>`)
        // console.warn(err)
      });
  } catch (err) {
    // $value.parent().append(`<div class="alert alert-warning">${S(err).escapeHTML().s}</div>`)
    // console.warn(err)
  }
});

$('span.mathjax.raw')
  .removeClass('raw')
  .each(function(key, value) {
    var $value = $(value);
    var $ele = $(value)
      .parent()
      .parent();
    $value.unwrap();

    let result;
    if ($(value).hasClass('display')) {
      result = katex.renderToString($value.text(), {
        throwOnError: false,
        displayMode: true,
      });
    } else {
      result = katex.renderToString($value.text(), {
        throwOnError: false,
      });
    }

    $value.html(result);
    $value.children().unwrap();
  });

$('span.abc.raw')
  .removeClass('raw')
  .each((key, value) => {
    try {
      var $value = $(value);
      var $ele = $(value)
        .parent()
        .parent();

      abcjs.renderAbc(value, $value.text());

      $ele.addClass('abc');
      $value
        .children()
        .unwrap()
        .unwrap();
      const svg = $ele.find('> svg');
      svg[0].setAttribute(
        'viewBox',
        `0 0 ${svg.attr('width')} ${svg.attr('height')}`,
      );
      svg[0].setAttribute('preserveAspectRatio', 'xMidYMid meet');
    } catch (err) {
      $value.unwrap();
      $value
        .parent()
        .append(
          `<div class="alert alert-warning">${S(err).escapeHTML().s}</div>`,
        );
      console.warn(err);
    }
  });

// regex for extra tags
const spaceregex = /\s*/;
const notinhtmltagregex = /(?![^<]*>|[^<>]*<\/)/;
let coloregex = /\[color=([#|(|)|\s|,|\w]*?)\]/;
coloregex = new RegExp(coloregex.source + notinhtmltagregex.source, 'g');
let nameregex = /\[name=(.*?)\]/;
let timeregex = /\[time=([:|,|+|-|(|)|\s|\w]*?)\]/;
const nameandtimeregex = new RegExp(
  nameregex.source +
    spaceregex.source +
    timeregex.source +
    notinhtmltagregex.source,
  'g',
);
nameregex = new RegExp(nameregex.source + notinhtmltagregex.source, 'g');
timeregex = new RegExp(timeregex.source + notinhtmltagregex.source, 'g');

function replaceExtraTags(html) {
  html = html.replace(coloregex, '<span class="color" data-color="$1"></span>');
  html = html.replace(
    nameandtimeregex,
    '<small><i class="fa fa-user"></i> $1 <i class="fa fa-clock-o"></i> $2</small>',
  );
  html = html.replace(
    nameregex,
    '<small><i class="fa fa-user"></i> $1</small>',
  );
  html = html.replace(
    timeregex,
    '<small><i class="fa fa-clock-o"></i> $1</small>',
  );
  return html;
}

$('blockquote')
  .removeClass('.raw')
  .each(function(_, elem) {
    const p = $(elem).find('p');
    p[0].innerHTML = replaceExtraTags(p[0].innerHTML);

    // color tag in blockquote will change its left border color
    const blockquoteColor = $(elem).find('.color');
    blockquoteColor.each((key, value) => {
      $(value)
        .closest('blockquote')
        .css('border-left-color', $(value).attr('data-color'));
    });
  });

// update continue line numbers
const linenumberdivs = $('.gutter.linenumber').toArray();
for (let i = 0; i < linenumberdivs.length; i++) {
  if ($(linenumberdivs[i]).hasClass('continue')) {
    const startnumber = linenumberdivs[i - 1]
      ? parseInt(
          $(linenumberdivs[i - 1])
            .find('> span')
            .last()
            .attr('data-linenumber'),
        )
      : 0;
    $(linenumberdivs[i])
      .find('> span')
      .each((key, value) => {
        $(value).attr('data-linenumber', startnumber + key + 1);
      });
  }
}
