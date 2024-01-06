extends Node2D

var peer
var DOMAIN

# Called when the node enters the scene tree for the first time.
func _ready() -> void:

  var args = OS.get_cmdline_args()
  if "--release" in args:
    DOMAIN = "fdaa:2:a9c:a7b:22e:7993:1dd3:2"
  else:
    DOMAIN = "server.fly-godot-deploy.orb.local"

  
  if "--server" in args:
    start_server()
  elif "--client" in args:
    start_client()
  else:
    print("usage: godot --server|--client")
    get_tree().quit()


func start_server():
  var server = ENetMultiplayerPeer.new()
  server.create_server(8080, 2)
  multiplayer.multiplayer_peer = server
  multiplayer.peer_connected.connect(func(id):
    print("connected by: ", id)
  )
  multiplayer.peer_disconnected.connect(func(id):
    print("disconnected by: ", id)
  )

func start_client():
  var client = ENetMultiplayerPeer.new()
  client.create_client(DOMAIN, 8080)
  multiplayer.multiplayer_peer = client
  multiplayer.connected_to_server.connect(func():
    print("connected to server")
  )
  multiplayer.server_disconnected.connect(func():
    print("disconnected from server")
  )
