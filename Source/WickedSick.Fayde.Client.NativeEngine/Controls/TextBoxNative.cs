using System;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Controls
{
    public class TextBoxNative : ControlNative
    {
        public TextBoxNative(ScriptObject @object)
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