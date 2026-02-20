package main

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type AlarmData struct {
	BaseMusic string `json:"base-music"`
	Pitch     int    `json:"pitch"`
	Speed     int    `json:"speed"`
	FileName  string `json:"file-name"`
}

type AlarmDataResponse struct {
	BaseMusic string `json:"base-music"`
	Pitch     int    `json:"pitch"`
	Speed     int    `json:"speed"`
	Audio     string `json:"audio,omitempty"` // base64エンコードされた音声データ
}

func main() {
	// Echoインスタンスの作成
	e := echo.New()
	// ログレベルの設定

	// ミドルウェアの設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// ルートの定義
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "healthy",
		})
	})

	e.POST("/get", func(c echo.Context) error {
		// JSONファイルを読み込む
		filePath := "./shared/py2go/data/F58EA70F-F0CB-43C8-B4D5-5A5BA4DAC148.json"
		data, err := os.ReadFile(filePath)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to read alarm data",
			})
		}

		// JSONをパース
		var alarmData AlarmData
		if err := json.Unmarshal(data, &alarmData); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to parse alarm data",
			})
		}

		// レスポンス用の構造体にデータをセット
		alarmDataResponse := AlarmDataResponse{
			BaseMusic: alarmData.BaseMusic,
			Pitch:     alarmData.Pitch,
			Speed:     alarmData.Speed,
		}

		// 音声ファイルを読み込む（sample1に固定）
		audioFilePath := "./shared/py2go/music/" + alarmData.FileName
		c.Logger().Infof("Reading audio file: %s", alarmData.FileName)
		audioData, err := os.ReadFile(audioFilePath)
		if err != nil {
			c.Logger().Errorf("Failed to read audio file: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to read audio file",
			})
		}

		// base64エンコード
		alarmDataResponse.Audio = base64.StdEncoding.EncodeToString(audioData)

		return c.JSON(http.StatusOK, alarmDataResponse)
	})

	e.POST("/alarm/review", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"message": "OK",
		})
	})

	// サーバーの起動
	e.Logger.Fatal(e.Start(":8080"))
}
