package main

import (
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	"github.com/rs/zerolog"
	"github.com/ziflex/lecho/v2"
	"github.io/hashgraph/stable-coin/api/routes"
)

func init() {
	_ = godotenv.Load()
}

func main() {
	e := echo.New()

	logger := lecho.New(os.Stderr, lecho.WithTimestamp())
	logger.SetOutput(zerolog.ConsoleWriter{Out: os.Stderr, NoColor: false})

	// configure log level for mirror from env
	logger.SetLevel(mustParseEchoLogLevel(os.Getenv("MIRROR_API_LOG")))

	e.Logger = logger

	e.Use(middleware.Recover())

	e.Use(lecho.Middleware(lecho.Config{
		Logger: logger,
	}))

	e.Use(middleware.CORS())

	e.POST("/v1/token/join", routes.SendAnnounce)
	e.POST("/v1/token/mintTo", routes.SendMint)
	e.POST("/v1/token/transaction", routes.SendRawTransaction)

	err := e.StartServer(&http.Server{
		Addr:         ":" + os.Getenv("PORT"),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	})

	if err != nil {
		panic(err)
	}
}

func mustParseEchoLogLevel(s string) log.Lvl {
	return map[string]log.Lvl{
		"DEBUG": log.DEBUG,
		"INFO":  log.INFO,
		"WARN":  log.WARN,
		"ERROR": log.ERROR,
		"OFF":   log.OFF,
	}[s]
}
