extends Node2D

var IP_ADDR = "*"
var PORT = 5000
var SERVER_DOMAIN = "localhost"

func _ready() -> void:
  # load env
  if OS.get_environment("IP_ADDR"):
    IP_ADDR = OS.get_environment("IP_ADDR")
  if OS.get_environment("PORT"):
    PORT = int(OS.get_environment("PORT"))
  if OS.get_environment("SERVER_DOMAIN"):
    SERVER_DOMAIN = OS.get_environment("SERVER_DOMAIN")

  var args = OS.get_cmdline_args()
  if "--server" in args:
    start_server()
  elif "--client" in args:
    start_client()
  else:
    print("usage: godot --server|--client")
    get_tree().quit()


func start_server():
  var server = ENetMultiplayerPeer.new()
  server.set_bind_ip(IP_ADDR)
  server.create_server(PORT, 2)
  multiplayer.multiplayer_peer = server
  multiplayer.peer_connected.connect(func(id):
    print("connected by: ", id)
  )
  multiplayer.peer_disconnected.connect(func(id):
    print("disconnected by: ", id)
  )

func start_client():
  var client = ENetMultiplayerPeer.new()
  client.create_client(SERVER_DOMAIN, PORT)
  print("connecting to server...")
  multiplayer.multiplayer_peer = client
  multiplayer.connected_to_server.connect(func():
    print("connected to server")
  )
  multiplayer.server_disconnected.connect(func():
    print("disconnected from server")
  )
