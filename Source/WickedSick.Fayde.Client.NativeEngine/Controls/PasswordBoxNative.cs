using System;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Controls
{
    public class PasswordBoxNative : ControlNative
    {
        public PasswordBoxNative(ScriptObject @object)
            : base(@object)
        {
        }

        [ScriptableMember]
        public void InitializeSelectionBrushes()
        {
            throw new NotImplementedException();
        }
    }
}