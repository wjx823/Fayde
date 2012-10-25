
namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class PropertyPrecedence
    {
        public const int IsEnabled = 0;
        public const int LocalValue = 1;
        public const int DynamicValue = 2;

        public const int LocalStyle = 3;
        public const int ImplicitStyle = 4;

        public const int Inherited = 5;
        public const int InheritedDataContext = 6;
        public const int DefaultValue = 7;
        public const int AutoCreate = 8;

        public const int Lowest = AutoCreate;
        public const int Highest = IsEnabled;
        public const int Count = 9;
    }
}