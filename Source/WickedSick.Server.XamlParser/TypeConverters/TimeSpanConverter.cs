﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WickedSick.Server.XamlParser.Elements;

namespace WickedSick.Server.XamlParser.TypeConverters
{
    public class TimeSpanConverter : ITypeConverter
    {
        public Type ConversionType
        {
            get { return typeof(Elements.Types.TimeSpan); }
        }

        public object Convert(string from)
        {
            long ticks;
            if (long.TryParse(from, out ticks))
                return new Elements.Types.TimeSpan(ticks);

            int days = 0;
            int hours;
            int minutes;
            int seconds;
            int milliseconds = 0;

            string[] parts = from.Split(':');
            if (parts.Count() != 3)
                throw new ArgumentException("An invalid value for TimeSpan has been provided.");

            int periodIndex = parts[0].IndexOf(".");
            if (periodIndex > 0)
            {
                days = int.Parse(parts[0].Substring(0, periodIndex - 1));
                hours = int.Parse(parts[0].Substring(periodIndex + 1, parts[0].Length - (periodIndex + 1)));
            }
            else
                hours = int.Parse(parts[0]);

            minutes = int.Parse(parts[1]);

            double dsec;
            if (!double.TryParse(parts[2], out dsec))
                throw new ArgumentException("An invalid value for TimeSpan has been provided.");

            seconds = (int)dsec;
            milliseconds = (int)((dsec - Math.Floor(dsec)) * 1000.0);
            
            return new Elements.Types.TimeSpan(hours, minutes, seconds, days, milliseconds);
        }
    }
}
