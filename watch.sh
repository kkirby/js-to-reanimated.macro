#!/usr/bin/env bash
watchman -j <<-EOT
["trigger", "`pwd`/test/src", {
   "name": "macro-test",
   "command": ["npm", "run", "compile"],
   "append_files": false
}]
EOT