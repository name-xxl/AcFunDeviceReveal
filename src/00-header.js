// ==UserScript==
// @name         AcFunDeviceReveal - A站手机型号美化
// @namespace    http://acfun-device-reveal.local
// @version      2.1.0
// @description  将A站评论区的手机内部代号替换为友好名称，内置主流机型数据，支持导入扩充
// @author       name_xxl
// @match        https://www.acfun.cn/*
// @match        https://m.acfun.cn/*
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @noframes
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';
