# fix -s/-c to --server, --client
arg=$1
if [ "$arg" = "-s" ]; then
    arg="--server"
elif [ "$arg" = "-c" ]; then
    arg="--client"
fi

godot --headless -d main.tscn $arg