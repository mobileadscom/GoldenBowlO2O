var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var extractPlugin = new ExtractTextPlugin({
    filename: '[name]-[hash].css'
})

module.exports = {
	devServer: {
        inline:true,
        port: 8080
    },
	entry: {
        'index': './public/javascripts/index.js',
        'coupon': './public/javascripts/main.js',
    },
	output: {
		path: __dirname + '/public/dist',
		filename: '[name]-[hash].js',
		// publicPath: '/public/dist',
	 //    library: 'app',
		// libraryTarget: 'var'
	},
	module: {
		rules: [
		    {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015']
                        }
                    }
                ]
	     	},
	     	{
		        test: /\.css$/,
            	use: extractPlugin.extract({
            		use: ["css-loader"]
            	})
		    },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(jpg|png|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/',
                            publicPath: 'images/'
                        }
                    }
                ]
            }
            /* For SASS */
            // {
            // 	test: /\.scss$/,
            // 	use: extractPlugin.extract({
            // 		use: ['css-loader', 'sass-loader']
            // 	})
            // }
		]	
	},
	plugins: [
        extractPlugin,
        new HtmlWebpackPlugin({
            // inject: true,
            filename: 'index.html',
            chunks: ['index'],
            template: 'public/index.html'
        }),
        new HtmlWebpackPlugin({
            // inject: true,
            filename: 'coupon.html',
            chunks: ['coupon'],
            template: 'public/coupon.html'
        }),
        new CleanWebpackPlugin(['dist'])
	]
};