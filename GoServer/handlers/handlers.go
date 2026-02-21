package handlers

import (
	"encoding/base64"
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/labstack/echo/v4"
	"main/models"
)

// HandleHealth はヘルスチェックエンドポイントのハンドラー
func HandleHealth(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "healthy",
	})
}

// HandleGetAlarm はアラームデータを取得して返すハンドラー
func HandleGetAlarm(c echo.Context) error {
	// 1. shared/py2go/data ディレクトリ内のJSONファイル一覧を取得
	dataDir := "./shared/py2go/data"
	entries, err := os.ReadDir(dataDir)
	if err != nil {
		c.Logger().Errorf("Failed to read data directory: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to read data directory",
		})
	}

	// JSONファイルのみをフィルタリング
	var jsonFiles []string
	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".json" {
			jsonFiles = append(jsonFiles, entry.Name())
		}
	}

	// JSONファイルが存在しない場合
	if len(jsonFiles) == 0 {
		c.Logger().Warn("No JSON files found in data directory")
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "No JSON files found",
		})
	}

	// 2. JSONファイルからランダムに一つを選ぶ
	rand.Seed(time.Now().UnixNano())
	selectedFile := jsonFiles[rand.Intn(len(jsonFiles))]
	jsonPath := filepath.Join(dataDir, selectedFile)
	c.Logger().Infof("Selected JSON file: %s", selectedFile)

	// JSONファイルを読み込む
	data, err := os.ReadFile(jsonPath)
	if err != nil {
		c.Logger().Errorf("Failed to read JSON file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to read JSON file",
		})
	}

	// JSONをパース
	var alarmData models.AlarmData
	if err := json.Unmarshal(data, &alarmData); err != nil {
		c.Logger().Errorf("Failed to parse JSON file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to parse JSON file",
		})
	}

	// レスポンス用の構造体にデータをセット
	alarmDataResponse := models.AlarmDataResponse{
		BaseMusic: alarmData.BaseMusic,
		Pitch:     alarmData.Pitch,
		Speed:     alarmData.Speed,
	}

	// 3. 音声ファイルを読み込んでエンコード
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

	// レスポンスを送信
	responseErr := c.JSON(http.StatusOK, alarmDataResponse)

	// 4. 送信したJSONファイルとWAVファイルを削除
	if err := os.Remove(jsonPath); err != nil {
		log.Printf("Warning: Failed to delete JSON file %s: %v", jsonPath, err)
	}

	if err := os.Remove(audioFilePath); err != nil {
		log.Printf("Warning: Failed to delete WAV file %s: %v", audioFilePath, err)
	}

	return responseErr
}

// HandleAlarmReview はアラームのレビューを受け付けるハンドラー
func HandleAlarmReview(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"message": "OK",
	})
}
