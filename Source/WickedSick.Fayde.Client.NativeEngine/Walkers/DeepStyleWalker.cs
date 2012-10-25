using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Walkers
{
    public class DeepStyleWalker
    {
        private SetterWrapper[] _Setters;
        private int _Offset = 0;

        public DeepStyleWalker(ScriptObject style)
        {
            var dps = new Dictionary<DependencyPropertyWrapper, SetterWrapper>();
            var list = new List<SetterWrapper>();
            var cur = style;
            while (cur != null)
            {
                var setters = (cur.GetProperty("Setters") as ScriptObject).GetProperty("_ht") as ScriptObject[];
                for (int i = setters.Length - 1; i >= 0; i--)
                {
                    var setter = new SetterWrapper(setters[i]);
                    var prop = setter.Property;
                    if (prop == null)
                        continue;
                    if (dps.ContainsKey(prop))
                        continue;
                    dps[prop] = setter;
                    list.Add(setter);
                }
                cur = cur.GetProperty("BasedOn") as ScriptObject;
            }
            _Setters = list.OrderBy(GetSetterPropertyID).ToArray();
        }

        public DeepStyleWalker(ScriptObject[] styles)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns>ScriptObject that represents a Setter.</returns>
        public SetterWrapper Step()
        {
            if (_Offset < _Setters.Length)
            {
                var s = _Setters[_Offset];
                _Offset++;
                return s;
            }
            return null;
        }

        private int GetSetterPropertyID(SetterWrapper setter)
        {
            var a = setter.Property;
            return a._ID;
        }
    }
}