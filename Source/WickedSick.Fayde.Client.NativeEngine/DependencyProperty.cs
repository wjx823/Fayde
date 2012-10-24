using System;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    [ScriptableType]
    public class DependencyProperty
    {
        [ScriptableMember]
        public int _ID { get; set; }

        [ScriptableMember]
        public string Name { get; set; }

        [ScriptableMember]
        public object DefaultValue { get; set; }

        [ScriptableMember]
        public bool _HasDefaultValue { get; set; }

        [ScriptableMember]
        public bool _IsAutoCreated { get; set; }

        [ScriptableMember]
        public bool _IsCustom { get; set; }

        private int _BitmaskCache;
        public int BitmaskCache
        {
            get
            {
                if (_BitmaskCache == 0)
                {
                    _BitmaskCache |= 1 << PropertyPrecedence.Inherited;
                    _BitmaskCache |= 1 << PropertyPrecedence.DynamicValue;
                    if (_IsAutoCreated)
                        _BitmaskCache |= 1 << PropertyPrecedence.AutoCreate;
                    if (_HasDefaultValue)
                        _BitmaskCache |= 1 << PropertyPrecedence.DefaultValue;
                }
                return _BitmaskCache;
            }
        }

        internal object _GetAutoCreatedValue(DependencyObject @do)
        {
            throw new NotImplementedException();
        }
    }
}
