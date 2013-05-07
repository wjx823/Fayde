/// <reference path="../Core/DependencyObject.ts" />
/// CODE

module Fayde.Controls {
    export interface IItemCollection {
        ItemsChanged: MulticastEvent;
        ToArray(): any[];
        
        GetValueAt(index: number): any;
        GetRange(startIndex: number, endIndex: number): any[];
        SetValueAt(index: number, value: any);
        Contains(value: any): bool;
        IndexOf(value: any): number;
        Add(value: any);
        AddRange(values: any[]);
        Insert(index: number, value: any);
        Remove(value: any);
        RemoveAt(index: number);
        Clear();
    }

    export interface IItemCollectionHidden extends IItemCollection {
        IsReadOnly: bool;
        SetValueAtImpl(index: number, value: any);
        AddImpl(value: any);
        AddRangeImpl(values: any[]);
        InsertImpl(index: number, value: any);
        RemoveImpl(value: any);
        RemoveAtImpl(index: number);
        ClearImpl();
    }

    export class ItemCollection extends DependencyObject implements IEnumerable, IItemCollection, IItemCollectionHidden {
        private _ht: any[] = [];

        GetEnumerator(): IEnumerator {
            return ArrayEx.GetEnumerator(this._ht);
        }
        ItemsChanged: MulticastEvent = new MulticastEvent();
        PropertyChanged: MulticastEvent = new MulticastEvent();
        ToArray(): any[] { return this._ht.slice(0); }

        get Count(): number { return this._ht.length; }

        private IsReadOnly: bool = false;

        GetValueAt(index: number): any {
            var ht = this._ht;
            if (index < 0 || index >= ht.length)
                throw new IndexOutOfRangeException(index);
            return ht[index];
        }

        GetRange(startIndex: number, endIndex: number): any[] { return this._ht.slice(startIndex, endIndex); }

        SetValueAt(index: number, value: any) {
            this._ValidateReadOnly();
            this.SetValueAtImpl(index, value);
        }
        private SetValueAtImpl(index: number, value: any) {
            var ht = this._ht;
            if (index < 0 || index >= ht.length)
                throw new IndexOutOfRangeException(index);
            var oldValue = ht[index];
            ht[index] = value;
            this.ItemsChanged.Raise(this, Collections.NotifyCollectionChangedEventArgs.Replace(value, oldValue, index));
        }

        Add(value: any) {
            this._ValidateReadOnly();
            if (value == null)
                throw new ArgumentException("value");
            this.AddImpl(value);
        }
        private AddImpl(value: any) {
            var index = this._ht.push(value) - 1;
            this.ItemsChanged.Raise(this, Collections.NotifyCollectionChangedEventArgs.Add(value, index));
        }

        AddRange(values: any[]) {
            this._ValidateReadOnly();
            if (!values) return;
            for (var i = 0 ; i < values.length; i++) {
                if (values[i] == null) throw new ArgumentException("value");
            }
            this.AddRangeImpl(values);
        }
        private AddRangeImpl(values: any[]) {
            var index = this._ht.push(values) - 1;
            this.ItemsChanged.Raise(this, Collections.NotifyCollectionChangedEventArgs.AddRange(values, index));
        }

        Insert(value: any, index: number) {
            this._ValidateReadOnly();
            if (value == null)
                throw new ArgumentException("value");
            this.InsertImpl(value, index);
        }
        private InsertImpl(value: any, index: number) {
            var ht = this._ht;
            if (index < 0 || index > ht.length)
                throw new IndexOutOfRangeException(index);
            if (index >= ht.length)
                ht.push(value);
            else
                ht.splice(index, 0, value);
            this.ItemsChanged.Raise(this, Collections.NotifyCollectionChangedEventArgs.Add(value, index));
        }
        
        IndexOf(value: any): number {
            return this._ht.indexOf(value);
        }
        Contains(value: any): bool {
            return this._ht.indexOf(value) > 0;
        }

        Remove(value: any) {
            this._ValidateReadOnly();
            this.RemoveImpl(value);
        }
        private RemoveImpl(value: any) {
            var index = this._ht.indexOf(value);
            if (index < 0)
                return;
            this._ht.splice(index, 1);
            this.ItemsChanged.Raise(this, Collections.NotifyCollectionChangedEventArgs.Remove(value, index));
        }

        RemoveAt(index: number) {
            this._ValidateReadOnly();
            if (index < 0 || index >= this._ht.length)
                throw new IndexOutOfRangeException(index);
            this.RemoveAtImpl(index);
        }
        private RemoveAtImpl(index: number) {
            var item = this._ht.splice(index, 1)[0];
            this.ItemsChanged.Raise(this, Collections.NotifyCollectionChangedEventArgs.Remove(item, index));
        }
        
        Clear() {
            this._ValidateReadOnly();
            this.ClearImpl();
        }
        private ClearImpl() {
            this._ht = [];
            this.ItemsChanged.Raise(this, Collections.NotifyCollectionChangedEventArgs.Reset());
        }
        
        private _ValidateReadOnly() {
            if (this.IsReadOnly)
                throw new InvalidOperationException("The collection is readonly.");
        }
    }
    Nullstone.RegisterType(ItemCollection, "ItemCollection");
}