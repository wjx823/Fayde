using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class LazyMember<T>
    {
        private ScriptObject _SO;
        private string _MemberName;

        public LazyMember(ScriptObject so, string memberName)
        {
            _SO = so;
            _MemberName = memberName;
        }

        private bool _IsCreated;

        private T _Value;
        public T Value
        {
            get
            {
                if (_IsCreated)
                    return _Value;
                _Value = (T)_SO.GetProperty(_MemberName);
                _IsCreated = true;
                return _Value;
            }
        }

        public void Invalidate()
        {
            _IsCreated = false;
        }
    }
}