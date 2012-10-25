using System;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Walkers
{
    public class VisualTreeWalker
    {
        public enum VisualTreeWalkerDirection
        {
            Logical,
            LogicalReverse,
            ZForward,
            ZReverse,
        }

        private int _Offset;
        private ScriptObject _Content;
        private ScriptObject _Collection;
        private VisualTreeWalkerDirection _Direction;

        public VisualTreeWalker(ScriptObject uie, VisualTreeWalkerDirection direction = VisualTreeWalkerDirection.Logical)
        {
            if (uie == null)
                return;
            _Offset = 0;
            _Content = uie.GetProperty("_SubtreeObject") as ScriptObject;
            _Direction = direction;
            if (_Content != null)
            {
                if (Nullstone.Is(_Content, JsTypeNames.Collection))
                {
                    _Collection = _Content;
                    if (!Nullstone.Is(_Collection, JsTypeNames.UIElementCollection))
                        _Direction = VisualTreeWalkerDirection.Logical;
                }
            }
        }

        public UIElementNative Step()
        {
            if (_Collection == null)
            {
                if (_Offset == 0)
                {
                    _Offset++;
                    return DependencyObjectNative.GetFromScriptObject(_Content) as UIElementNative;
                }
                return null;
            }

            var count = Count;
            if (count < 0 || _Offset >= count)
                return null;
            if (count == 1 && _Offset == 0)
            {
                _Offset++;
                return DependencyObjectNative.GetFromScriptObject(GetValueAt(0)) as UIElementNative;
            }

            if (_Direction == VisualTreeWalkerDirection.ZForward || _Direction == VisualTreeWalkerDirection.ZReverse)
                EnsureZSorted();

            ScriptObject result = null;
            switch (_Direction)
            {
                case VisualTreeWalkerDirection.ZForward:
                    result = GetValueAtZIndex(_Offset);
                    break;
                case VisualTreeWalkerDirection.ZReverse:
                    result = GetValueAtZIndex(count - (_Offset + 1));
                    break;
                case VisualTreeWalkerDirection.Logical:
                    result = GetValueAt(_Offset);
                    break;
                case VisualTreeWalkerDirection.LogicalReverse:
                    result = GetValueAt(count - (_Offset + 1));
                    break;
            }
            _Offset++;
            return DependencyObjectNative.GetFromScriptObject(result) as UIElementNative;
        }

        private int Count
        {
            get
            {
                if (_Content == null)
                    return 0;
                if (_Collection == null)
                    return 1;
                var func = _Collection.GetProperty("GetCount") as ScriptObject;
                if (func == null)
                    return 0;
                var obj = func.InvokeSelf();
                if (obj is double)
                    return (int)(double)obj;
                return 0;
            }
        }

        private void EnsureZSorted()
        {
            var func = _Collection.GetProperty("EnsureZSorted") as ScriptObject;
            if (func == null)
                return;
            func.InvokeSelf();
        }

        private ScriptObject GetValueAtZIndex(int index)
        {
            var func = _Collection.GetProperty("GetValueAtZIndex") as ScriptObject;
            if (func == null)
                return null;
            return func.InvokeSelf(index) as ScriptObject;
        }

        private ScriptObject GetValueAt(int index)
        {
            var func = _Collection.GetProperty("GetValueAt") as ScriptObject;
            if (func == null)
                return null;
            return func.InvokeSelf(index) as ScriptObject;
        }
    }
}