using System;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class SetterWrapper
    {
        public ScriptObject Object { get; protected set; }

        public SetterWrapper(ScriptObject @object)
        {
            Object = @object;
        }

        public DependencyPropertyWrapper Property
        {
            get
            {
                throw new NotImplementedException();
            }
        }
        public object ConvertedValue
        {
            get
            {
                throw new NotImplementedException();
            }
        }
    }
}