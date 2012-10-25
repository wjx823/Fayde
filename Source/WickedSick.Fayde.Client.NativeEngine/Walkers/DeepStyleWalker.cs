using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Walkers
{
    public class DeepStyleWalker
    {
        private SetterNative[] _Setters;
        private int _Offset = 0;

        public DeepStyleWalker(ScriptObject style)
        {
            var dps = new Dictionary<DependencyPropertyWrapper, SetterNative>();
            var list = new List<SetterNative>();
            var cur = style;
            while (cur != null)
            {
                list.AddRange(GetSetters(cur, dps));
                cur = cur.GetProperty("BasedOn") as ScriptObject;
            }
            _Setters = list.OrderBy(GetSetterPropertyID).ToArray();
        }

        public DeepStyleWalker(ScriptObject[] styles)
        {
            if (styles == null)
                return;

            var dps = new Dictionary<DependencyPropertyWrapper, SetterNative>();
            var list = new List<SetterNative>();
            var stylesSeen = new List<double>();
            for (int i = 0; i < 3; i++)
            {
                var style = styles[i];
                while (style != null)
                {
                    if (stylesSeen.Contains((double)style.GetProperty("_ID")))
                        continue;

                    list.AddRange(GetSetters(style, dps));

                    stylesSeen.Add((double)style.GetProperty("_ID"));
                    style = style.GetProperty("BasedOn") as ScriptObject;
                }
            }
            throw new NotImplementedException();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns>ScriptObject that represents a Setter.</returns>
        public SetterNative Step()
        {
            if (_Offset < _Setters.Length)
            {
                var s = _Setters[_Offset];
                _Offset++;
                return s;
            }
            return null;
        }

        private int GetSetterPropertyID(SetterNative setter)
        {
            var a = setter.Property;
            return a._ID;
        }

        private IEnumerable<SetterNative> GetSetters(ScriptObject style, Dictionary<DependencyPropertyWrapper, SetterNative> visitedDPs)
        {
            var setters = (style.GetProperty("Setters") as ScriptObject).GetProperty("_ht") as ScriptObject[];
            for (int i = setters.Length - 1; i >= 0; i--)
            {
                var setter = DependencyObjectNative.GetFromScriptObject(setters[i]) as SetterNative;
                if (setter == null)
                    continue;
                var prop = setter.Property;
                if (prop == null)
                    continue;
                if (visitedDPs.ContainsKey(prop))
                    continue;
                visitedDPs[prop] = setter;
                yield return setter;
            }
        }
    }
}