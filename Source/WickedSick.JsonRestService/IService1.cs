using System.ServiceModel;
using System.ServiceModel.Web;

namespace WickedSick.JsonRestService
{
    [ServiceContract]
    public interface IService1
    {
        [OperationContract]
        [WebInvoke(Method = "GET", UriTemplate = "/GetData", RequestFormat = WebMessageFormat.Json,
                   ResponseFormat = WebMessageFormat.Json)]
        string GetData();
    }
}
