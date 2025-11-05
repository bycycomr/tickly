namespace Tickly.Api.Configuration
{
    public class DatabaseSettings
    {
        public int CommandTimeout { get; set; } = 30;
        public int RetryCount { get; set; } = 5;
        public int RetryDelaySeconds { get; set; } = 5;
    }
}
