angular.module('buiiltApp')
.factory('quoteRequetService', function($http, API_URL) {
  var url = API_URL + 'api/quoteRequests/';
  return {
    /**
     * send quote request to user
     *
     * @param {Object} data
     * @returns {$promise}
     */
    create: function(data){
      return $http.post(url, data).then(function(res){ return res.data; });
    },

    // sendQuoteFromContractorToBuilder: function(data){
    //   return $http.post(url,data).then(function(res){return res.data;});
    // },

    /**
     * find one quote request
     * @param {String} id
     */
    findOne: function(id){
      return $http.get(url + id).then(function(res){ return res.data; });
    },

    selectQuote: function(id) {
      return $http.put(url + id).then(function(res){ return res.data;});
    }
  };
});