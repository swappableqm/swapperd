package stdlog

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/fatih/color"
)

type LogUnit struct {
	Type   string
	String string
}

var LogLevels = map[string]LogUnit{
	"debug": {
		Type:   "level",
		String: color.MagentaString("[DEBUG]"),
	},
	"info": {
		Type:   "level",
		String: color.BlueString("[INFO]"),
	},
	"warn": {
		Type:   "level",
		String: color.YellowString("[WARN]"),
	},
	"error": {
		Type:   "level",
		String: color.RedString("[ERROR]"),
	},
}

var LogServices = map[string]LogUnit{
	"server": {
		Type:   "service",
		String: color.GreenString("[SERVER]"),
	},
	"grpc-bus": {
		Type:   "service",
		String: color.MagentaString("[GRPC BUS]"),
	},
}

// without normalising the args, the stdout result is wrapped in two sets of brackets
// this is bc of nested slices
func _normaliseArgs(args ...any) []any {
	var out []any

	for _, a := range args {
		switch v := a.(type) {
		case []string:
			for _, s := range v {
				out = append(out, s)
			}
		case []any:
			out = append(out, v...)
		default:
			out = append(out, a)
		}
	}

	return out
}

// add spaces between args
// (this is why we aren't using fmt.Sprint)
func _joinArgs(args ...any) string {
	var parts []string

	for _, a := range args {
		parts = append(parts, fmt.Sprint(a))
	}

	return strings.Join(parts, " ")
}

// add prefix to logger ([MICROSERVICE] [LEVEL] [SERVICE])
func _generatePrefix(micro string, level, service LogUnit) string {
	return micro + " " + color.RedString(level.String) + " " + color.RedString(service.String)
}

func _generateSuffix() string {
	c := color.New(color.FgHiBlack, color.Italic)
	return c.SprintFunc()(time.Now().UTC().String())
}

func UniformLog(micro string, level, service LogUnit, args ...any) {
	microFormatted := micro
	log.Println(_generatePrefix(microFormatted, level, service), _joinArgs(_normaliseArgs(args...)...), _generateSuffix())
}

func LifecycleLog(level, service LogUnit, args ...any) {
	UniformLog(color.GreenString("[LIFECYCLE]"), level, service, args)
}

func OrchestratorLog(level, service LogUnit, args ...any) {
	UniformLog(color.MagentaString("[ORCHESTRATOR]"), level, service, args)
}
