/// <reference path="../Runtime/Nullstone.js" />
/// <reference path="../Core/Collections/DependencyObjectCollection.js"/>
/// CODE
/// <reference path="ColumnDefinition.js"/>

(function (namespace) {
    var ColumnDefinitionCollection = Nullstone.Create("ColumnDefinitionCollection", Fayde.DependencyObjectCollection);

    ColumnDefinitionCollection.Instance.AddedToCollection = function (value, error) {
        if (this.Contains(value)) {
            error.SetErrored(BError.Argument, "ColumnDefinition is already a member of this collection.");
            return false;
        }
        return this.AddedToCollection$DependencyObjectCollection(value, error);
    };
    ColumnDefinitionCollection.Instance.IsElementType = function (value) {
        return value instanceof namespace.ColumnDefinition;
    };

    namespace.ColumnDefinitionCollection = Nullstone.FinishCreate(ColumnDefinitionCollection);
})(Nullstone.Namespace("Fayde.Controls"));