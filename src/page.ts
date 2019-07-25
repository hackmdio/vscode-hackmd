// page renderer script

import 'bootstrap3/dist/css/bootstrap.min.css';
import './mermaid.css';
import './style.css';

import * as $ from 'jquery';

import * as mermaid from 'mermaid';
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

