import {AppBar, Avatar, IconButton, Toolbar, Typography} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Image from "next/image";

export default function Home() {
    return (
        <div className="h-screen">
            <AppBar className="bg-pink-500">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{mr: 2}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        BA Tools Resource
                    </Typography>
                    <Avatar alt="arona" src="avatar.png"></Avatar>
                </Toolbar>
            </AppBar>
            <main className="flex h-full w-full justify-center items-center">
                <div className="flex flex-col w-full items-center">
                    <Image src="/logo.png" alt="logo" width={512} height={512}/>
                    <div className="flex flex-col w-full items-center">
                        <h1 className="text-4xl flex">欢迎使用Ba Tools Resource</h1>
                        <p className="text-xl py-2">
                            此项目使用
                            <a href="https://github.com/SchaleDB/SchaleDB">Schale DB</a>
                            作为数据源，并在此基础上新增了学生的live 2d图像
                        </p>
                        <div className="flex flex-col max-w-[1200px] items-start">
                            <h2 className="text-2xl py-2">✨ 使用方法</h2>
                            <div className="use-method">
                                <ul className="list-disc pl-5">
                                    <li className="mb-2 text-lg p-2">
                                        此 api 的 url 路径与 Schale DB 的路径基本相同，如果你想访问 Schale DB 中
                                        <code
                                            className="bg-gray-200 p-1 mx-1 rounded">data/zh/students.json</code> 的数据，<br/>
                                        那么你可以通过
                                        <code className="bg-gray-200 p-1 mx-1 rounded">GET</code>
                                        <a href="https://api.hanasaki.tech/data/zh/students.json"
                                        >https://api.hanasaki.tech/data/zh/students.json</a
                                        >
                                        来访问该数据
                                    </li>
                                    <li>
                                        新增 live 2D image 的请求路径为
                                        <code>images/student/l2d/&lt;学生id&gt;.webp</code> <br/>例如：
                                        <a href="https://api.hanasaki.tech/images/student/l2d/10000.webp"
                                        >https://api.hanasaki.tech/images/student/l2d/10000.webp</a
                                        >
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}