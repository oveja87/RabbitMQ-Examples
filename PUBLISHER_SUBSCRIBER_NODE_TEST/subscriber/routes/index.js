
 /*
 * GET home page.
 */

 exports.index = function(req, res){
  var urlToListen = "http://"+req.headers.host+"/";
  res.render('index', { title: 'Welcome', urlToListen:urlToListen });
 };

 exports.about = function(req, res){
  res.render('about', { title: 'About' });
 };