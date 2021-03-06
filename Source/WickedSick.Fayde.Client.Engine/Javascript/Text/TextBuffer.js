﻿/// <reference path="../Runtime/Nullstone.js"/>
/// CODE

(function (Text) {
    var _TextBuffer = Nullstone.Create("_TextBuffer");

    _TextBuffer.Instance.Init = function () {
        this._Text = null;
    };

    _TextBuffer.Instance.GetLength = function () {
        if (this._Text == null)
            return 0;
        return this._Text.length;
    };

    _TextBuffer.Instance.Reset = function () {
        this._Text = null;
    };
    _TextBuffer.Instance.Prepend = function (str) {
        if (!this._Text)
            this._Text = str;
        else
            this._Text = str + this._Text;
    };
    _TextBuffer.Instance.Append = function (str) {
        if (!this._Text)
            this._Text = str;
        else
            this._Text += str;
    };
    _TextBuffer.Instance.Cut = function (start, len) {
        if (!this._Text) {
            this._Text = null;
            return;
        }
        this._Text = this._Text.slice(0, start) + this._Text.slice(start + len);
    };
    _TextBuffer.Instance.Insert = function (index, str) {
        if (!this._Text)
            this._Text = str;
        else
            this._Text = [this._Text.slice(0, index), str, this._Text.slice(index)].join('');
    };
    _TextBuffer.Instance.Replace = function (start, len, str) {
        if (!this._Text) {
            this._Text = str;
            return;
        }
        this._Text = [this._Text.slice(0, start), str, this._Text.slice(start + len)].join('');
    };

    Text._TextBuffer = Nullstone.FinishCreate(_TextBuffer);
})(Nullstone.Namespace("Fayde.Text"));