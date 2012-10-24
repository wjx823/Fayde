
namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public static class Inheritable
    {
        public const int Foreground = 1 << 0;
        public const int FontFamily = 1 << 1;
        public const int FontStretch = 1 << 2;
        public const int FontStyle = 1 << 3;
        public const int FontWeight = 1 << 4;
        public const int FontSize = 1 << 5;
        public const int Language = 1 << 6;
        public const int FlowDirection = 1 << 7;
        public const int UseLayoutRounding = 1 << 8;
        public const int TextDecorations = 1 << 9;

        public const int All = (1 << 10) - 1;
        public const int None = 0;
    }
}