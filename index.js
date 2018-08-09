//Texto do placar
function Text(font, size, rgb) {
	this.font = font 	|| "Courier";
	this.size = size 	|| 20;
	this.color = rgb 	|| "#00ff19" ;

	this.raster = function(ctx, text, x, y) {
		ctx.font = "" + this.size + "px " + this.font;
		ctx.fillStyle = this.color;
		ctx.fillText(text, x, y);// escreve na tela
	}
}
//variaveis globais
var pause = false;
var inicio = false;

var texto = new Text();
//Imagens do jogo
var fundo = new Image();
fundo.src = "img/fundo.jpg";

var spritePlayer = new Image();
spritePlayer.src = "img/Nave1.png";

var spriteBot = new Image();
spriteBot.src = "img/Nave2.png";
//sons do jogo
var musica = new Audio("sound/war.m4a");

var tiro1 = new Audio();
tiro1.src = "sound/tiro.mp3";
var tiro2 = new Audio();
tiro2.src = "sound/tiro_forte.mp3";

var atira1 = function(){
	tiro1.volume = 1.0;
	tiro1.pause();
	tiro1.load();
	tiro1.play();
}

var atira2 = function(){
	tiro2.volume = 0.3;
	tiro2.pause();
	tiro2.load();
	tiro2.play();
}
//Regra do jogo
function start() {
	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");// cria o contexto
	// define as constantes
	const WIDTH = canvas.offsetWidth;
	const HEIGHT = canvas.offsetHeight;

	const FPS = 60;
	const DT = 1/FPS;
	const G = -20;
	//toca a musica de fundo em loop
	musica.volume = 1.0;
	musica.play();
	musica.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	});
	//variaveis globais
	var shots = []; var shoot = false;
	var shotsBot = []; //var shoot2 = false;
	//cria a nave do player
	var shooter1 = new Shooter({x: 0, y: 0}, {w: 30, h: 35}, "black", 2*Math.PI, spritePlayer);
	//tiros do player
	var ball = new Shot(shooter1.ballPos.x, (shooter1.ballPos.y-shooter1.center.h), 0, 325, 12, 1);

	var bots = [];//vetor de inimigos

	var frequenciaBots = 0;//determina a frequencia de novos inimigos
	var movimentoBot = null;
	//cria o identificador de movimento dos bots
	function defineMovimento(bot){
		if(bot.center.x<200){
			return 1;
		}if(bot.center.x>300){
			return 2;
		}else {
			return 5;
		}
	}
	//cria novos bots
	function criaBot(){
		frequenciaBots = frequenciaBots + 1 * DT;
		if(frequenciaBots > 2){//tempo em segundos para criar um novo sprite
			frequenciaBots = 0;
			var bot = new Shooter({x: Math.random()*WIDTH, y: 0}, {w: 45, h: 25}, "yellow", Math.PI, spriteBot);
			movimentoBot = defineMovimento(bot);//quando cria um novo bot, altera os movimentos de todos
			bots.push(bot);
			//console.log(bots.length);
		}
	}
	//movimento dos bots
	function moverBot(){
		for (var i = 0; i < bots.length; i++) {

			bots[i].moveBot(DT, movimentoBot);
			bots[i].draw(ctx);//desenha os bots
			if(bots[i].isForaTelaBot()){//verifica se estao saindo da tela
				bots.splice(i, 1);
			}
		}
	}
	//verifica a colisao entre naves
	function colideNave(s1, s2){
		if(s1.center.x+(s1.size.w/2) >= s2.center.x-(s2.size.w/2) &&
			s1.center.x-(s1.size.w/2) <= s2.center.x+(s2.size.w/2) &&
			s1.center.y+(s1.size.h/2) >= s2.center.y-(s2.size.h/2) &&
			s1.center.y-(s1.size.h/2) <= s2.center.y+(s2.size.h/2)){
				return true;
			}
			return false;
	}
	//cria a barra de vida
	var bar = { pos: new Point(75, 7), size: new Size(410, 15), energy: 1.0 };
	//cria variaveis de controle
	var recomeca = true;
	var verificaInicio = false;
	//define o texto dos "menus"
	var msgInicio = new Text("Courier", 30, "black");
	var msg = new Text("Courier", 25, "#00ff19");

	function atira(){
		for (var i = 0; i < bots.length; i++) {
			if (bots[i].cadenciaTiro > 1.8) {//controla o tempo entre os tiros
				bots[i].cadenciaTiro = 0;
				var ballBot = new ShotBot({x:bots[i].ballPos.x, y:bots[i].ballPos.y+bots[i].size.h}, {vx:0, vy:0}, 12);
				shotsBot.push(ballBot);
				atira2();
				ballBot = null;
			}
		}
	}
	//reset do jogo
	function reset() {
		ctx.clearRect(0, 0, WIDTH, HEIGHT);// limpa a tela do jogo
		// limpa os tiros da tela
		shots.length = 0;
		shotsBot.length = 0;
		if(!recomeca){//mantem a mensagem na tela
				musica.pause();
				msgInicio.raster(ctx, "Game over!", WIDTH/8, HEIGHT/4);
				msgInicio.raster(ctx, "Aperte R para continuar", WIDTH/8, HEIGHT/2 );
			}
		verificaInicio = true;
		//coloca a nave na posicao inicial
		shooter1.center = {x: WIDTH/2, y: HEIGHT-shooter1.size.h};
		//volta as propriedades do shooter ao padrao do inicio
		shooter1.reset();
		bots.length = 0;//apaga todos os bots
		bar.energy = 1.0;//reseta a vida da nave
	}; reset();
	//regra do jogo
	var loop = function() {
		if(inicio && !pause && recomeca){
		ctx.clearRect(0, 0, WIDTH, HEIGHT);//limpa a tela
		//desenha o fundo do jogo
		ctx.drawImage(fundo, 0, 0);
		//texto da tela do jogo
		texto.raster(ctx, "Vida:", 10, 20);
		texto.raster(ctx, "Pontos: " + shooter1.pontos, 10, 40);

		musica.play();//toca a musica do jogo
		//controle visual da barra de vida
		ctx.strokeStyle = "#a0afa1";//Controla a borda
		if(bar.energy<=0.2){//Controla a cor
			texto.raster(ctx, "Vida baixa!", bar.size.w/2, 20);
			ctx.fillStyle = "#ff1000";
		}else if(bar.energy>0.2 && bar.energy<=0.4){
			ctx.fillStyle = "#a51309";
		}else if(bar.energy>0.4 && bar.energy<=0.7){
			ctx.fillStyle = "#e1ff00";
		}else if(bar.energy>0.7 && bar.energy<=0.9){
			ctx.fillStyle = "#ff9000";
		}else {
			ctx.fillStyle = "#00ff15";
		}
		//desenha a barra no ctx
		ctx.fillRect(bar.pos.x, bar.pos.y, bar.energy * bar.size.w, bar.size.h);
    ctx.strokeRect(bar.pos.x, bar.pos.y, bar.size.w, bar.size.h);
		//instancia novos bots
		criaBot();
		atira();
		//Verifica colisao dos tiros com os bots
		for(var i = 0; i < shots.length; i++){
			for (var j = 0; j < bots.length; j++) {
				if(((shots[i].pos.x >= bots[j].center.x-bots[j].size.w) && (shots[i].pos.x <= bots[j].center.x+bots[j].size.w)) &&
				((shots[i].pos.y >= bots[j].center.y-bots[j].size.h) && (shots[i].pos.y <= bots[j].center.y+bots[j].size.h))) {
					shots.splice(i, 1);//apaga os tiros que colidiram
					bots.splice(j, 1);
					shooter1.pontos++;
					break;
				}
			}
		}
		//Verifica colisao dos tiros com o player
		for(var i = 0; i < shotsBot.length; i++){
				if(((shotsBot[i].pos.x >= shooter1.center.x-shooter1.size.w) && (shotsBot[i].pos.x <= shooter1.center.x+shooter1.size.w)) &&
				((shotsBot[i].pos.y >= shooter1.center.y-shooter1.size.h) && (shotsBot[i].pos.y <= shooter1.center.y+shooter1.size.h))) {
					shotsBot.splice(i, 1);//apaga os tiros que colidiram
					bar.energy -= 0.1;
					break;
				}
		}
		//contadores para o for do tiro
		var cont, cont2;
		//tiros player 1
		for(cont = 0; cont < shots.length; cont++) {
			shots[cont].movexUp(DT);
			//Apaga os tiros que saem da tela
			if(shots[cont].isForaTela()){//verifica se o tiro saiu da tela
				shots.splice(cont, 1);// remove o tiro do vetor
			}
		}
		//tiros bots
		for(cont2 = 0; cont2 < shotsBot.length; cont2++) {
			shotsBot[cont2].movexDown(DT);
			//Apaga os tiros que saem da tela
			if(shotsBot[cont2].isForaTela()){// impõe limites
				shotsBot.splice(cont2, 1);// remove o tiro do vetor
			}
		}
		//Movimenta a nave e os inimigos
		shooter1.move(DT);
		moverBot();
		//desenha os tiros na tela
		shots.forEach( function(shot) { shot.draw(ctx); } );
		shotsBot.forEach( function(shotBot) { shotBot.draw(ctx); } );
		//desenha as naves na tela
		shooter1.draw(ctx);
		// determina o fim de jogo
		if(bar.energy <= 0.0){
			recomeca = false;
			reset();
		}
		//verifica a colisao entre o player e os bots
		for (var i = 0; i < bots.length; i++) {
			if(colideNave(shooter1, bots[i])){
				bots.splice(i, 1);
				bar.energy -= 0.1;
			}
		}
		//mostraFundo(ctx, fundo);
	}else if(!inicio){// exibe a mensagem da tela inicial
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		msgInicio.raster(ctx, "Aperte ENTER para começar", 25, HEIGHT/2 );
	}else if(pause){// exibe a mensagem de jogo pausado
		msg.raster(ctx, "Aperte P para continuar", (WIDTH/6), HEIGHT/2 );
	}
}

	setInterval(loop, 1000/FPS);
	//controles do jogo
	addEventListener("keydown", function(e){
		if(e.keyCode == 32 && !shoot) { // Espaco, tiro player 1
			ball.pos = {x: shooter1.ballPos.x, y: (shooter1.ballPos.y)}; // marca a posicao da bala
			shots.push(ball); // adiciona a bala no vetor de tiros
			ball = null; // apaga a bala auxiliar
			shoot = true;// bloqueia a repeticao do tiro
			atira1();// toca o som do tiro
			e.preventDefault();
		}if(e.keyCode == 37){ // esquerda player 1
			shooter1.vx = -150;
			e.preventDefault();
		}if(e.keyCode == 39){ // direita player 1
			shooter1.vx = 150;
			e.preventDefault();
		}if (e.keyCode == 38) { // cima player 1
			shooter1.vy = -200;
			e.preventDefault();
    }if (e.keyCode == 40) { // baixo player 1
			shooter1.vy = 200;
			e.preventDefault();
    }
    if(e.keyCode == 13){// Enter
			inicio = true;
			e.preventDefault();
		}if(e.keyCode == 80){// P
				pause = !pause;
		}if (e.keyCode == 82) {// R
				recomeca = true;
		}
	});

	addEventListener("keyup", function(e){
		if(e.keyCode == 32) { // Espaco player 1
			ball = new Shot(shooter1.ballPos.x, shooter1.ballPos.y, 325, 0, 12, 1);// prepara a nova bala
			shoot = false;
		}
		if(e.keyCode == 37 || e.keyCode == 39){ //esquerda e direita player 1
			shooter1.ax = 0;
			shooter1.vx = 0;
		}
		if (e.keyCode == 38 || e.keyCode == 40) { //cima e baixo player 1
      shooter1.ay = 0;
			shooter1.vy = 0;
    }
	});
}
