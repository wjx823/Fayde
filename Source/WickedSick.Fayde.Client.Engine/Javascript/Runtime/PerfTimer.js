﻿/// <reference path="Nullstone.js"/>

(function (Fayde) {
    var PerfTimer = Nullstone.Create("PerfTimer");

    PerfTimer.Instance.Init = function () {
        this.IsDisabled = false;
        this.ReportFunc = function () { };
    };

    PerfTimer.Instance.Start = function () {
        if (this.IsDisabled)
            return;
        this._StartTime = new Date().getTime();
    };
    PerfTimer.Instance.Stop = function () {
        if (this.IsDisabled)
            return;
        var endTime = new Date().getTime();
        var elapsed = endTime - this._StartTime;
        if (this.ReportFunc)
            this.ReportFunc(elapsed);
        return elapsed;
    };

    Fayde.PerfTimer = Nullstone.FinishCreate(PerfTimer);
})(Nullstone.Namespace("Fayde"));