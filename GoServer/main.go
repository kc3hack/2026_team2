package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"main/handlers"
)

func main() {
	// Echoインスタンスの作成
	e := echo.New()

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// ルーティングの設定
	// ヘルスチェック
	e.GET("/health", handlers.HandleHealth)

	// アラームデータ取得
	e.POST("/get", handlers.HandleGetAlarm)

	// アラームレビュー
	e.POST("/alarm/review", handlers.HandleAlarmReview)

	// サーバーの起動
	e.Logger.Fatal(e.Start(":8080"))
}
