/**
 * Created by zengwei on 2017/9/19
 */

"use strict";

// 1、需要chrome浏览器插件的自动编译刷新(有点迟钝。。。)

// module.exports = function (grunt) {
//     // Project configuration.
//     grunt.initConfig({
//         pkg: grunt.file.readJSON('package.json'),
//         uglify: {
//             options: {
//                 banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
//             },
//             build: {
//                 src: 'assets/js/*.js',
//                 //<%= pkg.name %>
//                 dest: 'build/assets/js/app.min.js'
//             }
//         },
//         watch: {
//             html: {
//                 files: ['templates/*.html', './index.html'],
//                 options: {livereload: true}
//             },
//             css: {
//                 files: ['assets/css/*.css'],
//                 options: {livereload: true}
//             },
//             js: {
//                 files: ['assets/js/*.js'],
//                 options: {livereload: true}
//             },
//             less: {
//                 files: ['assets/**/*.less'],
//                 options: {livereload: false},
//                 tasks: ['less']
//             }
//         },
//         less: {
//             page: {
//                 options: {
//                     //配置项
//                     compress: false,  //CSS 压缩
//                     sourceMap: false
//                 },
//                 files: {
//                     //目标文件，将 page.less 文件编译压缩后，生成 page.css 文件
//                     'assets/css/demo.css': 'assets/less/*.less'
//                 }
//             }
//         }
//     });
//
//     // Load the plugin that provides the "uglify" task.
//     grunt.loadNpmTasks('grunt-contrib-uglify');
//     grunt.loadNpmTasks('grunt-contrib-less');
//     grunt.loadNpmTasks('grunt-contrib-watch');
//     grunt.loadNpmTasks('grunt-contrib-connect');
//
//
//     // Default task(s).
//     grunt.registerTask('dev-watch', ['watch']);
//     grunt.registerTask('build', ['uglify']);
//
// }

// 2、不需要chrome浏览器插件的自动编译刷新(重新编译css也是一样慢)

module.exports = function (grunt) {

    // LiveReload的默认端口号，你也可以改成你想要的端口号
    var lrPort = 35729;
    // 使用connect-livereload模块，生成一个与LiveReload脚本
    // <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
    var lrSnippet = require('connect-livereload')({port: lrPort});
    // 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var lrMiddleware = function (connect, options, middlwares) {
        return [
            lrSnippet,
            // 静态文件服务器的路径 原先写法：connect.static(options.base[0])
            serveStatic(options.base[0]),
            // 启用目录浏览(相当于IIS中的目录浏览) 原先写法：connect.directory(options.base[0])
            serveIndex(options.base[0])
        ];
    };


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // 打包前先删除原有文件夹
        clean: {
            build: {
                src: ['./webapp']
            }
        },
        //压缩合并css
        cssmin: {
            //文件头部输出信息
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                //美化代码
                beautify: {
                    //中文ascii化，非常有用！防止中文乱码的神配置
                    ascii_only: true
                },
                // sourceMap: true,
                sourceMap: false,
            },
            my_target: {
                files: [
                    {
                        src: ['assets/css/*.css'],
                        dest: 'webapp/assets/css/app.min.css',
                        // dest: 'assets/css/app.min.css'
                    }
                ]
            }
        },
        // 压缩合并js
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            my_target: {
                options: {
                    // sourceMap: false,
                    sourceMap: true,
                    // sourceMapName: 'path/to/sourcemap.map'
                },
                files: {
                    'webapp/assets/js/app.min.js': ['assets/js/*.js'],
                    // 'assets/js/app.min.js': ['assets/js/*.js'],
                }
            }
            // build: {
            //     src: 'assets/js/*.js',
            //     //<%= pkg.name %>
            //     dest: 'webapp/assets/js/app.min.js'
            // }
        },
        // 打包静态资源image,html,font
        copy: {
            main: {
                // expand: true,
                // src: '*',
                src: ['./assets/img/*', './index.html', './templates/*'],
                dest: 'webapp/',
            },
        },
        watch: {
            html: {
                files: ['templates/*.html', './index.html'],
                options: {livereload: true}
            },
            css: {
                files: ['assets/css/*.min.css'],
                options: {livereload: true},
                tasks: ['autoprefixer']
            },
            js: {
                files: ['assets/js/*.js'],
                options: {livereload: true},
                // 只能单独分开文件夹
                // tasks: ['uglify']
            },
            less: {
                // files: ['assets/**/*.less'],
                files: ['assets/less/*.less'],
                options: {livereload: false},
                tasks: ['less']
            }
        },
        less: {
            page: {
                options: {
                    //配置项
                    compress: false,  //CSS 压缩
                    sourceMap: true
                },
                files: {
                    //目标文件，将 page.less 文件编译压缩后，生成 page.css 文件
                    'assets/css/app.min.css': 'assets/less/*.less'
                }
            }
        },
        autoprefixer: {
            options: {
                //配置项
                browsers: ['last 2 versions', 'ie 8', 'ie 9']  //浏览器兼容
            },
            your_target: {
                //目标文件
                src: [
                    'assets/css/app.min.css'  //将哪个 CSS 文件中的 CSS 属性添加私有前缀
                ]
            }
        },
        connect: {
            server: {
                options: {
                    open: true,
                    // 服务器端口号
                    port: 8002,
                    // 服务器地址(可以使用主机名localhost，也能使用IP)
                    hostname: 'localhost',
                    // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                    // base: ['./']
                    base: '.',
                    // keepalive: true,
                    protocol: 'http',
                    livereload: true
                }
            },
            livereload: {
                options: {
                    // 通过LiveReload脚本，让页面重新加载。
                    middleware: lrMiddleware
                }
            }
        },
    });

    // Load the plugin that provides the "uglify" task.
    // grunt.loadNpmTasks('grunt-contrib-livereload');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-autoprefixer');

    // Default task(s).
    grunt.registerTask('dev', ['connect', 'watch']);
    grunt.registerTask('build', ['clean', 'uglify', 'cssmin', 'copy']);

}
