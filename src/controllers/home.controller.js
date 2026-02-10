class HomeController {
	/*
	* Adds two numbers together and returns the result.
	* @param { number } req
	* @param { number } res
	*/
	static getHomePage(req, res) {
		res.json({
			message: 'Bem-vindo à Home Page (com TypeScript e rotas modulares) Yeah !',
			version: '0.1.1',
			status: 'online',
		});
	}
}

export default HomeController;
