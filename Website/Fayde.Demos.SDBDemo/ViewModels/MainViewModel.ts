/// <reference path="../scripts/Fayde.d.ts" />

module Fayde.Demos.SDB.ViewModels {
    export class MainViewModel extends Fayde.MVVM.ViewModelBase {
        Songs;
        $Request: AjaxJsonRequest;
        Load() {
            this.$Request = new AjaxJsonRequest(result => this.Songs = result.CreateJson(), error => { });
            this.$Request.Get("Services/GetAllSongs.ashx", null);
        }
    }
    Nullstone.AutoNotifyProperty(MainViewModel, "Songs");
    Nullstone.RegisterType(MainViewModel, "MainViewModel", MVVM.ViewModelBase);
}