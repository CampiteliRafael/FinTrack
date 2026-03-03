# Módulo 9: DevOps e Deployment

## Objetivos deste Módulo

- Containerizar aplicação com Docker
- Orquestrar com docker-compose
- CI/CD com GitHub Actions
- Deploy em cloud (Railway, Vercel, Neon)
- Logging estruturado com Winston
- Monitoramento com Sentry
- Variáveis de ambiente em produção

## Índice

1. [Fundamentos de Redes para Deploy](#fundamentos-de-redes-para-deploy)
2. [SSH - Secure Shell](#ssh---secure-shell)
3. [Docker](#docker)
4. [docker-compose](#docker-compose)
5. [Nginx - Reverse Proxy e Servidor Web](#nginx---reverse-proxy-e-servidor-web)
6. [CI/CD com GitHub Actions](#cicd-com-github-actions)
7. [Cloud Deployment](#cloud-deployment)
8. [Logging Estruturado](#logging-estruturado)
9. [Monitoramento com Sentry](#monitoramento-com-sentry)
10. [Checklist de Conhecimentos](#checklist-de-conhecimentos)

---

## Fundamentos de Redes para Deploy

### Conceitos Básicos de Redes

#### IP (Internet Protocol)

```
┌────────────────────────────────────────┐
│  Endereço IP = "Endereço" do servidor │
├────────────────────────────────────────┤
│  IPv4: 192.168.1.100 (32 bits)         │
│  IPv6: 2001:0db8:85a3::8a2e:0370:7334 │
└────────────────────────────────────────┘
```

**IPv4 Classes:**
```
Classe A: 0.0.0.0     - 127.255.255.255  (16M hosts)
Classe B: 128.0.0.0   - 191.255.255.255  (65K hosts)
Classe C: 192.0.0.0   - 223.255.255.255  (254 hosts)
```

**Private IP Ranges (não roteáveis na internet):**
```
10.0.0.0      - 10.255.255.255     (Classe A)
172.16.0.0    - 172.31.255.255     (Classe B)
192.168.0.0   - 192.168.255.255    (Classe C)
127.0.0.1     - Localhost (loopback)
```

**Public IP vs Private IP:**
```
┌──────────────────────────────────────────────┐
│  Casa/Empresa (Rede Privada)                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ PC1     │  │ PC2     │  │ Servidor│      │
│  │192.168  │  │192.168  │  │192.168  │      │
│  │  .1.10  │  │  .1.20  │  │  .1.30  │      │
│  └────┬────┘  └────┬────┘  └────┬────┘      │
│       │            │            │            │
│       └────────────┴────────────┘            │
│                    │                         │
│           ┌────────▼────────┐                │
│           │  Router/NAT     │                │
│           │  IP Privado     │                │
│           └────────┬────────┘                │
└────────────────────┼─────────────────────────┘
                     │
                     │ IP Público: 203.0.113.50
                     │
            ┌────────▼────────┐
            │    Internet     │
            └─────────────────┘
```

#### Portas (Ports)

```
Porta = "Apartamento" no endereço IP

Servidor: 142.250.185.46:443
          └── IP ────┘  └ Porta

Portas conhecidas (0-1023):
20/21  - FTP
22     - SSH
25     - SMTP (Email)
53     - DNS
80     - HTTP
443    - HTTPS
3306   - MySQL
5432   - PostgreSQL
6379   - Redis
27017  - MongoDB

Portas registradas (1024-49151):
3000   - Node.js (dev)
4000   - Backend API (dev)
5173   - Vite (dev)
8080   - HTTP alternativo

Portas dinâmicas (49152-65535):
Usadas temporariamente pelo sistema
```

#### Firewall

```
Firewall = "Porteiro" do servidor

┌─────────────────────────────────────┐
│         Internet                    │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │   Firewall     │
        │  (ufw/iptables)│
        └───────┬────────┘
                │
      Permitir? │
      ┌─────────┴─────────┐
      │                   │
   ✅ Sim              ❌ Não
      │                   │
      ▼                   ▼
┌──────────┐         ┌─────────┐
│ Servidor │         │ Bloqueia│
└──────────┘         └─────────┘

Regras típicas:
✅ Porta 22  (SSH)     - Apenas IPs confiáveis
✅ Porta 80  (HTTP)    - Aberto
✅ Porta 443 (HTTPS)   - Aberto
❌ Porta 3306 (MySQL)  - Bloqueado (interno apenas)
❌ Porta 6379 (Redis)  - Bloqueado (interno apenas)
```

**Configurar firewall (Ubuntu/ufw):**

```bash
# Instalar ufw
sudo apt install ufw

# Permitir SSH (ANTES de habilitar!)
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir porta específica
sudo ufw allow 4000/tcp

# Permitir de IP específico
sudo ufw allow from 203.0.113.50 to any port 22

# Negar porta
sudo ufw deny 3306/tcp

# Habilitar firewall
sudo ufw enable

# Ver status
sudo ufw status verbose

# Listar regras numeradas
sudo ufw status numbered

# Remover regra
sudo ufw delete 3
```

### Protocolo TCP vs UDP

```
┌──────────────────────────────────────────┐
│  TCP (Transmission Control Protocol)    │
├──────────────────────────────────────────┤
│  ✅ Confiável (garante entrega)          │
│  ✅ Ordenado (mantém ordem de pacotes)   │
│  ✅ Controle de erros                    │
│  ❌ Mais lento (handshake, ACKs)         │
│                                          │
│  Usa: HTTP, HTTPS, SSH, FTP, SMTP       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  UDP (User Datagram Protocol)           │
├──────────────────────────────────────────┤
│  ❌ Não confiável (pode perder pacotes)  │
│  ❌ Não ordenado                         │
│  ✅ Mais rápido (sem overhead)           │
│  ✅ Menor latência                       │
│                                          │
│  Usa: DNS, VoIP, Video Streaming, Games │
└──────────────────────────────────────────┘
```

**Handshake TCP (3-way):**

```
Cliente                    Servidor
  │                           │
  ├─ SYN ───────────────────►│
  │                           │
  │◄────────────── SYN-ACK ──┤
  │                           │
  ├─ ACK ───────────────────►│
  │                           │
  │    Conexão estabelecida   │
  │◄─────────────────────────►│
```

### NAT (Network Address Translation)

```
┌─────────────────────────────────────────┐
│  Problema: IPv4 limitado (4 bilhões)    │
│  Solução: NAT (muitos IPs privados →    │
│                 1 IP público)           │
└─────────────────────────────────────────┘

Rede Interna                      Internet
192.168.1.10:5000 ────┐
                       │
192.168.1.20:6000 ────┼──►  Router NAT  ──► 203.0.113.50:12345
                       │   (traduz IPs)
192.168.1.30:7000 ────┘

Servidor externo vê apenas: 203.0.113.50
```

### Load Balancer

```
┌─────────────────────────────────────────┐
│  Distribui requisições entre servidores │
└─────────────────────────────────────────┘

              Internet
                 │
                 ▼
        ┌────────────────┐
        │ Load Balancer  │
        │  (Nginx/HAProxy)│
        └───────┬────────┘
                │
      ┌─────────┼─────────┐
      │         │         │
      ▼         ▼         ▼
  ┌──────┐  ┌──────┐  ┌──────┐
  │Server│  │Server│  │Server│
  │  1   │  │  2   │  │  3   │
  └──────┘  └──────┘  └──────┘

Algoritmos:
- Round Robin: Revezamento simples
- Least Connections: Servidor com menos conexões
- IP Hash: Mesmo IP vai para mesmo servidor
- Weighted: Servidores mais potentes recebem mais
```

### Proxy vs Reverse Proxy

```
┌────────────────────────────────────────┐
│  Forward Proxy (Proxy)                 │
│  Cliente ←─→ Proxy ───→ Internet       │
│  Oculta identidade do cliente          │
│  Ex: VPN, Corporate proxy              │
└────────────────────────────────────────┘

Cliente ──► Proxy ──────► Internet
           (oculta cliente)

┌────────────────────────────────────────┐
│  Reverse Proxy                         │
│  Cliente ───→ Proxy ←─→ Servidor       │
│  Oculta identidade do servidor         │
│  Ex: Nginx, Cloudflare                 │
└────────────────────────────────────────┘

Cliente ──► Reverse Proxy ──► Backend
           (oculta servidor)
```

**Nginx como Reverse Proxy:**

```nginx
# Cliente acessa: https://fintrack.com/api/users
# Nginx repassa para: http://localhost:4000/api/users

server {
    listen 443 ssl;
    server_name fintrack.com;

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### CDN (Content Delivery Network)

```
┌───────────────────────────────────────────┐
│  CDN = Rede de servidores distribuídos   │
│  Cache de conteúdo próximo ao usuário    │
└───────────────────────────────────────────┘

Sem CDN:
Usuário (Brasil) ──────────────► Servidor (EUA)
                  5000 km
                  Latência: 200ms

Com CDN:
Usuário (Brasil) ──► CDN (São Paulo) ──► Origem (EUA)
                100 km                     (apenas 1ª vez)
                Latência: 20ms

CDNs populares:
- Cloudflare (gratuito)
- AWS CloudFront
- Fastly
- Akamai
```

### Latência vs Bandwidth

```
┌──────────────────────────────────────────┐
│  Latência (Ping)                         │
│  Tempo para ida e volta                  │
│  Medida: ms (milissegundos)              │
│                                          │
│  Bom:     < 50ms                         │
│  Razoável: 50-100ms                      │
│  Ruim:    > 100ms                        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  Bandwidth (Largura de banda)            │
│  Quantidade de dados por segundo         │
│  Medida: Mbps, Gbps                      │
│                                          │
│  Casa:   10-100 Mbps                     │
│  Empresa: 100-1000 Mbps                  │
│  Datacenter: 1-10 Gbps                   │
└──────────────────────────────────────────┘

Analogia:
Latência = Velocidade do carro
Bandwidth = Largura da estrada
```

### Testar Rede

```bash
# Ping (testar latência)
ping google.com
ping 8.8.8.8

# Traceroute (ver caminho até servidor)
traceroute google.com
# Windows: tracert google.com

# Testar porta específica
telnet fintrack.com 443
nc -zv fintrack.com 443

# Ver portas abertas no servidor
netstat -tulpn
ss -tulpn

# Scan de portas (nmap)
nmap -p 1-1000 fintrack.com

# Ver conexões ativas
netstat -an | grep ESTABLISHED

# Bandwidth test
speedtest-cli

# DNS lookup
dig fintrack.com
nslookup fintrack.com

# Ver rota de rede
ip route
# Windows: route print

# Ver interfaces de rede
ip addr
ifconfig
# Windows: ipconfig
```

### Segurança de Rede

#### Fail2Ban (Proteção contra Brute Force)

```bash
# Instalar
sudo apt install fail2ban

# Configurar
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

```ini
# /etc/fail2ban/jail.local

[DEFAULT]
bantime = 3600        # 1 hora de ban
findtime = 600        # Janela de 10 min
maxretry = 5          # 5 tentativas

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 3          # SSH: apenas 3 tentativas

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

```bash
# Iniciar
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Ver status
sudo fail2ban-client status
sudo fail2ban-client status sshd

# Ver IPs banidos
sudo fail2ban-client get sshd banned

# Desbanir IP
sudo fail2ban-client set sshd unbanip 203.0.113.50
```

#### Rate Limiting (Nginx)

```nginx
# Limitar requisições por IP
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://localhost:4000;
        }
    }
}
```

### VPC (Virtual Private Cloud)

```
┌─────────────────────────────────────────────┐
│  VPC = Rede privada isolada na cloud       │
└─────────────────────────────────────────────┘

┌─────────────── VPC (10.0.0.0/16) ───────────┐
│                                              │
│  ┌─ Subnet Pública (10.0.1.0/24) ─┐         │
│  │  ┌──────────┐    ┌──────────┐  │         │
│  │  │ Load     │    │ Nginx    │  │         │
│  │  │ Balancer │    │ Reverse  │  │         │
│  │  └──────────┘    └──────────┘  │         │
│  └──────────────────────────────────┘        │
│                                              │
│  ┌─ Subnet Privada (10.0.2.0/24) ─┐         │
│  │  ┌──────────┐    ┌──────────┐  │         │
│  │  │ Backend  │    │ Backend  │  │         │
│  │  │ API 1    │    │ API 2    │  │         │
│  │  └──────────┘    └──────────┘  │         │
│  └──────────────────────────────────┘        │
│                                              │
│  ┌─ Subnet Privada (10.0.3.0/24) ─┐         │
│  │  ┌──────────┐    ┌──────────┐  │         │
│  │  │PostgreSQL│    │  Redis   │  │         │
│  │  └──────────┘    └──────────┘  │         │
│  └──────────────────────────────────┘        │
└──────────────────────────────────────────────┘
            │
            ▼ Internet Gateway
        Internet
```

### Conectividade Backend ↔ Database

**Opção 1: Localhost (Single Server)**

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/db
      #                                   ↑ nome do service

  postgres:
    image: postgres:17
```

**Opção 2: IP Privado (VPC)**

```bash
# Backend: 10.0.2.10
# Database: 10.0.3.20

DATABASE_URL=postgresql://user:pass@10.0.3.20:5432/db
```

**Opção 3: DNS Interno**

```bash
# AWS RDS endpoint
DATABASE_URL=postgresql://user:pass@fintrack-db.abc123.us-east-1.rds.amazonaws.com:5432/db
```

**⚠️ NUNCA expor banco de dados publicamente:**

```bash
# ❌ MAU: Database acessível da internet
0.0.0.0:5432 → PostgreSQL

# ✅ BOM: Database apenas rede privada
10.0.3.20:5432 → PostgreSQL (interno)
```

### Checklist de Segurança de Rede

```
✅ Firewall configurado (apenas portas necessárias)
✅ SSH com chave (sem senha)
✅ Fail2Ban ativo
✅ Rate limiting no Nginx
✅ Database não exposto publicamente
✅ Redis não exposto publicamente
✅ HTTPS (SSL/TLS) configurado
✅ Certificados válidos e renovando
✅ Backups automáticos
✅ Monitoramento ativo
✅ Logs estruturados
✅ Senhas fortes (secrets manager)
✅ Atualizações de segurança automáticas
```

---

## SSH - Secure Shell

### O que é SSH?

SSH (Secure Shell) é um protocolo de rede criptografado usado para acessar e gerenciar servidores remotos de forma segura.

```
┌────────────────────────────────────────────┐
│  SSH = Acesso remoto seguro via terminal  │
├────────────────────────────────────────────┤
│                                            │
│  Seu PC ──────► SSH ──────► Servidor      │
│         (criptografado)                    │
│                                            │
│  ✅ Conexão segura                         │
│  ✅ Autenticação forte                     │
│  ✅ Dados criptografados                   │
│  ✅ Transferência de arquivos              │
└────────────────────────────────────────────┘
```

**Usos comuns:**
- Acessar servidores remotos (VPS, EC2, etc)
- Deploy de aplicações
- Transferir arquivos (SCP, SFTP)
- Executar comandos remotamente
- Port forwarding (túneis)
- Git via SSH (GitHub, GitLab)

---

### Como Funciona SSH

#### Autenticação por Senha (Menos Seguro)

```
Cliente                           Servidor
  │                                  │
  ├─ SSH user@host ─────────────────►│
  │                                  │
  │◄─────── Solicita senha ──────────┤
  │                                  │
  ├──────── senha123 ────────────────►│
  │                                  │
  │◄───── Acesso concedido ──────────┤
  │                                  │
  │         Terminal remoto          │

❌ Problemas:
- Vulnerável a brute force
- Senhas podem ser fracas
- Keyloggers podem capturar
```

#### Autenticação por Chave SSH (Mais Seguro) ✅

```
┌─────────────────────────────────────────────┐
│  Chaves SSH (Criptografia Assimétrica)     │
├─────────────────────────────────────────────┤
│                                             │
│  Chave Privada (id_rsa)                     │
│  ├── Fica no seu computador                 │
│  └── NUNCA compartilhar!                    │
│                                             │
│  Chave Pública (id_rsa.pub)                 │
│  ├── Fica no servidor (~/.ssh/authorized_keys)│
│  └── Pode compartilhar                      │
└─────────────────────────────────────────────┘

Processo:
Cliente                           Servidor
  │                                  │
  ├─ SSH user@host ─────────────────►│
  │   (com chave privada)            │
  │                                  │
  │◄─ Challenge criptográfico ───────┤
  │                                  │
  ├─ Resposta assinada ──────────────►│
  │   (assina com chave privada)     │
  │                                  │
  │◄─ Verificação com chave pública ─┤
  │                                  │
  │◄───── Acesso concedido ──────────┤

✅ Vantagens:
- Sem senha para digitar
- Impossível brute force
- Chave privada pode ter senha (passphrase)
- Automação segura (CI/CD)
```

---

### Gerar Chaves SSH

#### Gerar novo par de chaves

```bash
# Gerar chave SSH (RSA 4096 bits)
ssh-keygen -t rsa -b 4096 -C "seu@email.com"

# Ou Ed25519 (mais moderno, mais seguro)
ssh-keygen -t ed25519 -C "seu@email.com"

# Prompts:
# Enter file in which to save the key: (Enter = padrão)
# ~/.ssh/id_rsa (RSA) ou ~/.ssh/id_ed25519 (Ed25519)

# Enter passphrase: (opcional, mas recomendado)
# senha_da_chave_privada

# Resultado:
# Your identification has been saved in ~/.ssh/id_rsa
# Your public key has been saved in ~/.ssh/id_rsa.pub
```

**Arquivos gerados:**

```bash
~/.ssh/
├── id_rsa           # Chave PRIVADA (NUNCA compartilhar!)
└── id_rsa.pub       # Chave PÚBLICA (pode compartilhar)
```

#### Ver chave pública

```bash
# Linux/macOS
cat ~/.ssh/id_rsa.pub

# Windows (PowerShell)
type $env:USERPROFILE\.ssh\id_rsa.pub

# Ou
cat ~/.ssh/id_ed25519.pub

# Output:
# ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC... seu@email.com
```

---

### Configurar SSH no Servidor

#### Adicionar chave pública ao servidor

```bash
# Método 1: ssh-copy-id (automático, mais fácil)
ssh-copy-id user@servidor.com
# Pede senha uma vez, depois nunca mais precisa

# Método 2: Manual
# 1. Copiar conteúdo de ~/.ssh/id_rsa.pub
cat ~/.ssh/id_rsa.pub

# 2. No servidor, adicionar a ~/.ssh/authorized_keys
ssh user@servidor.com
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2... seu@email.com" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit

# 3. Testar
ssh user@servidor.com
# Não pede senha!
```

#### Permissões corretas (IMPORTANTE!)

```bash
# Permissões SSH no servidor
chmod 700 ~/.ssh                    # Diretório: rwx------
chmod 600 ~/.ssh/authorized_keys    # Arquivo: rw-------
chmod 600 ~/.ssh/id_rsa            # Chave privada: rw-------
chmod 644 ~/.ssh/id_rsa.pub        # Chave pública: rw-r--r--
chmod 644 ~/.ssh/known_hosts       # Known hosts: rw-r--r--

# ⚠️ Se permissões estiverem erradas, SSH recusa conexão!
```

---

### Conectar via SSH

#### Sintaxe básica

```bash
# Formato: ssh [user@]host [-p port]

# Conectar com usuário específico
ssh user@servidor.com

# Conectar na porta padrão 22 (omitida)
ssh user@192.168.1.100

# Conectar em porta customizada
ssh user@servidor.com -p 2222

# Conectar com chave específica
ssh -i ~/.ssh/id_rsa_deploy user@servidor.com

# Conectar e executar comando
ssh user@servidor.com "ls -la /var/www"

# Conectar com verbose (debug)
ssh -v user@servidor.com
ssh -vv user@servidor.com  # Mais detalhes
ssh -vvv user@servidor.com # Máximo detalhe
```

#### Primeira conexão

```bash
ssh user@servidor.com

# Primeira vez mostra fingerprint:
The authenticity of host 'servidor.com (203.0.113.50)' can't be established.
ED25519 key fingerprint is SHA256:abc123...
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes

# Adiciona ao ~/.ssh/known_hosts
Warning: Permanently added 'servidor.com' (ED25519) to the list of known hosts.
```

---

### SSH Config File

Simplificar conexões com arquivo de configuração.

```bash
# Criar/editar ~/.ssh/config
nano ~/.ssh/config
```

```
# ~/.ssh/config

# Servidor de produção
Host prod
    HostName 203.0.113.50
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_rsa_prod

# Servidor de staging
Host staging
    HostName staging.fintrack.com
    User ubuntu
    Port 2222
    IdentityFile ~/.ssh/id_rsa_staging

# GitHub
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github

# Wildcards
Host *.amazonaws.com
    User ec2-user
    IdentityFile ~/.ssh/id_rsa_aws
    StrictHostKeyChecking no

# Defaults para todos
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
```

**Uso:**

```bash
# Em vez de:
ssh deploy@203.0.113.50 -i ~/.ssh/id_rsa_prod

# Basta:
ssh prod

# Muito mais simples!
ssh staging
```

---

### Transferir Arquivos com SSH

#### SCP (Secure Copy)

```bash
# Copiar arquivo local → servidor
scp arquivo.txt user@servidor.com:/caminho/destino/

# Copiar diretório local → servidor (recursivo)
scp -r pasta/ user@servidor.com:/caminho/destino/

# Copiar servidor → local
scp user@servidor.com:/caminho/arquivo.txt ~/Downloads/

# Copiar diretório servidor → local
scp -r user@servidor.com:/var/www/html ~/backup/

# Copiar com porta customizada
scp -P 2222 arquivo.txt user@servidor.com:/tmp/

# Copiar múltiplos arquivos
scp file1.txt file2.txt user@servidor.com:/tmp/

# Preservar timestamps e permissões
scp -p arquivo.txt user@servidor.com:/tmp/

# Verbose (debug)
scp -v arquivo.txt user@servidor.com:/tmp/
```

#### SFTP (SSH File Transfer Protocol)

```bash
# Conectar via SFTP
sftp user@servidor.com

# Comandos SFTP:
sftp> ls                    # Listar remoto
sftp> lls                   # Listar local
sftp> pwd                   # Dir remoto atual
sftp> lpwd                  # Dir local atual
sftp> cd /var/www           # Mudar dir remoto
sftp> lcd ~/Desktop         # Mudar dir local

# Upload
sftp> put arquivo.txt       # Upload arquivo
sftp> put -r pasta/         # Upload diretório

# Download
sftp> get arquivo.txt       # Download arquivo
sftp> get -r pasta/         # Download diretório

# Outros
sftp> mkdir nova_pasta      # Criar diretório remoto
sftp> rm arquivo.txt        # Remover arquivo remoto
sftp> bye                   # Sair
```

#### rsync via SSH (Mais Eficiente)

```bash
# Sincronizar diretório local → servidor
rsync -avz -e ssh pasta/ user@servidor.com:/destino/

# Flags:
# -a: archive (preserva tudo)
# -v: verbose
# -z: compressão
# -e ssh: usar SSH

# Sincronizar com progresso
rsync -avz --progress -e ssh pasta/ user@servidor.com:/destino/

# Dry run (testar sem executar)
rsync -avzn -e ssh pasta/ user@servidor.com:/destino/

# Excluir arquivos
rsync -avz --exclude 'node_modules' --exclude '.git' \
  -e ssh pasta/ user@servidor.com:/destino/

# Delete: remover no destino o que não existe na origem
rsync -avz --delete -e ssh pasta/ user@servidor.com:/destino/
```

---

### Port Forwarding (Túneis SSH)

#### Local Port Forwarding

Acessar serviço remoto como se fosse local.

```bash
# Formato: ssh -L [local_port:]remote_host:remote_port user@ssh_server

# Exemplo: Acessar PostgreSQL remoto na porta 5432
ssh -L 5432:localhost:5432 user@servidor.com

# Agora:
psql -h localhost -p 5432 -U postgres
# Conecta no PostgreSQL do servidor!

# Acesso banco privado através de bastion host
ssh -L 3306:db.internal:3306 user@bastion.com

# Múltiplas portas
ssh -L 5432:localhost:5432 -L 6379:localhost:6379 user@servidor.com
```

#### Remote Port Forwarding

Expor serviço local para servidor remoto.

```bash
# Formato: ssh -R [remote_port:]local_host:local_port user@ssh_server

# Exemplo: Servidor acessa seu localhost:3000
ssh -R 8080:localhost:3000 user@servidor.com

# No servidor:
curl http://localhost:8080
# Acessa seu localhost:3000!

# Útil para:
# - Demos (servidor acessa seu dev local)
# - Webhooks (servidor recebe do seu local)
```

#### Dynamic Port Forwarding (SOCKS Proxy)

```bash
# Criar proxy SOCKS5
ssh -D 1080 user@servidor.com

# Configurar navegador para usar:
# SOCKS5 proxy: localhost:1080

# Todo tráfego do navegador passa pelo servidor!
# Útil para:
# - Bypass firewalls
# - Acessar recursos internos da empresa
```

---

### Configurar SSH no GitHub

#### Adicionar chave SSH ao GitHub

```bash
# 1. Gerar chave (se não tiver)
ssh-keygen -t ed25519 -C "seu@email.com"

# 2. Copiar chave pública
cat ~/.ssh/id_ed25519.pub
# ou
clip < ~/.ssh/id_ed25519.pub  # Windows
pbcopy < ~/.ssh/id_ed25519.pub  # macOS

# 3. GitHub:
# Settings → SSH and GPG keys → New SSH key
# Title: "Meu Notebook"
# Key: [colar chave pública]
# Add SSH key

# 4. Testar
ssh -T git@github.com

# Resposta esperada:
# Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

#### Usar SSH com Git

```bash
# Clonar via SSH (em vez de HTTPS)
git clone git@github.com:user/repo.git

# Mudar remote de HTTPS para SSH
git remote set-url origin git@github.com:user/repo.git

# Verificar
git remote -v
# origin  git@github.com:user/repo.git (fetch)
# origin  git@github.com:user/repo.git (push)

# Push/pull funcionam sem senha!
git push origin main
```

---

### Hardening SSH (Segurança)

#### Configurar servidor SSH

```bash
# Editar config do servidor SSH
sudo nano /etc/ssh/sshd_config
```

```bash
# /etc/ssh/sshd_config

# ✅ Porta customizada (evita bots)
Port 2222

# ✅ Apenas chave SSH (desabilitar senha)
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no

# ✅ Desabilitar root login
PermitRootLogin no

# ✅ Apenas usuários específicos
AllowUsers deploy ubuntu

# ✅ Timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# ✅ Desabilitar X11 forwarding (se não usar)
X11Forwarding no

# ✅ Limite de tentativas
MaxAuthTries 3
MaxSessions 5

# ✅ Apenas protocolo 2 (mais seguro)
Protocol 2
```

**Aplicar mudanças:**

```bash
# Testar configuração
sudo sshd -t

# Reiniciar SSH
sudo systemctl restart sshd
# ou
sudo service ssh restart

# ⚠️ NÃO feche a sessão atual antes de testar nova conexão!
# Abra nova aba e teste: ssh user@servidor.com -p 2222
```

#### Fail2Ban (Proteção Brute Force)

Já coberto na seção de Redes, mas importante para SSH:

```bash
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 2222  # Sua porta customizada
maxretry = 3
bantime = 3600
```

---

### Comandos SSH Úteis

#### Gerenciar conexões

```bash
# Ver sessões SSH ativas
who
w

# Matar sessão SSH
pkill -u username

# Ver processos SSH
ps aux | grep sshd

# Monitorar logins SSH
tail -f /var/log/auth.log  # Ubuntu/Debian
tail -f /var/log/secure    # CentOS/RHEL

# Estatísticas SSH
sudo systemctl status sshd
```

#### SSH Agent (Gerenciar chaves)

```bash
# Iniciar SSH agent
eval "$(ssh-agent -s)"

# Adicionar chave privada ao agent
ssh-add ~/.ssh/id_rsa
ssh-add ~/.ssh/id_ed25519

# Listar chaves no agent
ssh-add -l

# Remover chave do agent
ssh-add -d ~/.ssh/id_rsa

# Remover todas chaves
ssh-add -D

# Chave com passphrase (pede senha uma vez)
ssh-add ~/.ssh/id_rsa
# Enter passphrase: ****
# Identity added: ~/.ssh/id_rsa
```

#### Manter conexão viva (evitar timeout)

```bash
# Cliente: ~/.ssh/config
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3

# Servidor: /etc/ssh/sshd_config
ClientAliveInterval 60
ClientAliveCountMax 3
```

---

### Troubleshooting SSH

#### Problemas comuns

**1. Permission denied (publickey)**

```bash
# Verificar:
# 1. Chave pública no servidor?
ssh user@servidor.com
cat ~/.ssh/authorized_keys

# 2. Permissões corretas?
ls -la ~/.ssh/
# Devem ser: 700 para .ssh, 600 para authorized_keys

# 3. Chave correta sendo usada?
ssh -i ~/.ssh/id_rsa user@servidor.com

# 4. SELinux bloqueando? (CentOS/RHEL)
sudo restorecon -R -v ~/.ssh
```

**2. Connection refused**

```bash
# Verificar:
# 1. SSH rodando?
sudo systemctl status sshd

# 2. Porta correta?
netstat -tlnp | grep sshd
# ou
ss -tlnp | grep sshd

# 3. Firewall bloqueando?
sudo ufw status
sudo ufw allow 22/tcp
```

**3. Host key verification failed**

```bash
# Fingerprint mudou (reinstalou servidor)
WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!

# Remover entrada antiga
ssh-keygen -R servidor.com
# ou editar
nano ~/.ssh/known_hosts
# Remover linha do servidor.com

# Reconectar
ssh user@servidor.com
```

**4. Too many authentication failures**

```bash
# Muitas chaves no agent
ssh-add -D  # Remover todas
ssh-add ~/.ssh/id_rsa_correta  # Adicionar apenas a correta
```

**5. Debug SSH**

```bash
# Cliente: modo verbose
ssh -vvv user@servidor.com

# Servidor: debug mode
sudo /usr/sbin/sshd -d -p 2222

# Ver logs do servidor
tail -f /var/log/auth.log
```

---

### SSH no CI/CD (GitHub Actions)

#### Deploy via SSH com GitHub Actions

```yaml
# .github/workflows/deploy.yml

name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.SERVER_IP }} >> ~/.ssh/known_hosts

      - name: Deploy via SSH
        run: |
          ssh deploy@${{ secrets.SERVER_IP }} << 'EOF'
            cd /opt/fintrack
            git pull origin main
            npm install --production
            npm run build
            pm2 restart fintrack
          EOF

      - name: Cleanup
        if: always()
        run: rm -rf ~/.ssh
```

**Secrets necessários (GitHub → Settings → Secrets):**
```
SSH_PRIVATE_KEY: [conteúdo de ~/.ssh/id_rsa]
SERVER_IP: 203.0.113.50
```

---

### Best Practices SSH

```
✅ Usar chaves SSH (nunca senhas)
✅ Chave privada com passphrase
✅ Porta SSH customizada (evitar 22)
✅ Desabilitar root login
✅ Desabilitar PasswordAuthentication
✅ Usar Fail2Ban
✅ Manter SSH atualizado
✅ Limitar usuários permitidos (AllowUsers)
✅ Usar SSH Agent (evitar digitar passphrase sempre)
✅ Usar ~/.ssh/config (organização)
✅ Backups das chaves privadas (seguro!)
✅ Rotação de chaves periodicamente
✅ Monitorar logs de autenticação
✅ Usar diferentes chaves para diferentes serviços
❌ NUNCA commitar chaves privadas no Git
❌ NUNCA compartilhar chave privada
❌ NUNCA usar chaves sem passphrase em produção
```

---

## Docker

### O que é Docker?

```
┌─────────────────────────────────────┐
│   Problema: "Funciona no meu PC"    │
├─────────────────────────────────────┤
│ Dev PC:  Windows, Node 18, npm 9   │
│ Staging: Ubuntu, Node 16, npm 8    │
│ Prod:    CentOS, Node 20, npm 10   │
└─────────────────────────────────────┘

Docker solução:
┌─────────────────────────────────────┐
│    Containerize a aplicação!        │
│  Mesmo ambiente: dev, staging, prod │
└─────────────────────────────────────┘
```

### Dockerfile

```dockerfile
# Dockerfile - Receita para criar container
# ============================================

# 1. Base image - Começar com imagem do Node
FROM node:18-alpine

# 2. Metadados
LABEL maintainer="seu@email.com"
LABEL version="1.0"

# 3. Diretório de trabalho
WORKDIR /app

# 4. Copiar arquivos de dependência
COPY package*.json ./

# 5. Instalar dependências
RUN npm ci --only=production

# 6. Copiar código
COPY src ./src
COPY prisma ./prisma

# 7. Gerar prisma client
RUN npx prisma generate

# 8. Expor porta
EXPOSE 3000

# 9. Variáveis de ambiente
ENV NODE_ENV=production

# 10. Comando para iniciar
CMD ["node", "src/index.js"]

# ============================================
# Construir imagem:
# docker build -t fintrack:1.0 .

# Executar container:
# docker run -p 3000:3000 fintrack:1.0
```

### Multi-stage Build (Otimizado)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Runtime (menor imagem)
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "src/index.js"]

# Resultado: Imagem muito menor (remove node-gyp, build tools)
```

### Docker Ignore

```dockerfile
# .dockerignore - O que NÃO incluir na imagem
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.*
.docker
.dockerignore
dist
build
```

### Executar com Docker

```bash
# Construir imagem
docker build -t fintrack:1.0 .

# Listar imagens
docker images

# Executar container
docker run -p 3000:3000 --name fintrack-app fintrack:1.0

# Executar em background
docker run -d -p 3000:3000 --name fintrack-app fintrack:1.0

# Ver logs
docker logs fintrack-app
docker logs -f fintrack-app  # Follow (em tempo real)

# Parar container
docker stop fintrack-app

# Remover container
docker rm fintrack-app

# Executar comando dentro do container
docker exec -it fintrack-app bash

# Ver recursos usados
docker stats
```

---

## docker-compose

### Setup Completo - Backend + BD

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ✅ Backend Node.js
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fintrack-api
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://fintrack:senha123@db:5432/fintrack_db
      JWT_SECRET: sua-chave-secreta-aqui
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    volumes:
      - ./src:/app/src  # Hot reload de código
    networks:
      - fintrack-network
    restart: unless-stopped

  # ✅ PostgreSQL
  db:
    image: postgres:15-alpine
    container_name: fintrack-db
    environment:
      POSTGRES_USER: fintrack
      POSTGRES_PASSWORD: senha123
      POSTGRES_DB: fintrack_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - fintrack-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fintrack"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # ✅ Redis Cache
  cache:
    image: redis:7-alpine
    container_name: fintrack-cache
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - fintrack-network
    restart: unless-stopped

  # ✅ PgAdmin (visualizar BD)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: fintrack-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - db
    networks:
      - fintrack-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  fintrack-network:
    driver: bridge

# ============================================
# Comandos:
# docker-compose up                 # Iniciar
# docker-compose up -d              # Background
# docker-compose down               # Parar
# docker-compose logs -f api        # Logs
# docker-compose exec api bash      # Shell
```

### Production docker-compose

```yaml
version: '3.8'

services:
  api:
    image: fintrack:1.0  # Usar imagem pronta, não build
    container_name: fintrack-api-prod
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://fintrack:${DB_PASSWORD}@db:5432/fintrack_db
      JWT_SECRET: ${JWT_SECRET}
      SENTRY_DSN: ${SENTRY_DSN}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - fintrack-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    container_name: fintrack-db-prod
    environment:
      POSTGRES_USER: fintrack
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: fintrack_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - fintrack-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fintrack"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

networks:
  fintrack-network:
    driver: bridge

volumes:
  postgres_data:
```

---

## Nginx - Reverse Proxy e Servidor Web

### O que é Nginx?

```
┌────────────────────────────────────────────┐
│  Nginx = Servidor Web + Reverse Proxy     │
├────────────────────────────────────────────┤
│                                            │
│  1. Servidor Web (serve arquivos HTML)    │
│  2. Reverse Proxy (repassa requisições)   │
│  3. Load Balancer (distribui carga)       │
│  4. Cache HTTP                             │
│  5. SSL/TLS Termination                    │
│                                            │
└────────────────────────────────────────────┘

Fluxo Típico:
┌─────────┐      ┌─────────┐      ┌──────────┐
│ Browser │─────►│  Nginx  │─────►│ Backend  │
│         │◄─────│  :80    │◄─────│ Node.js  │
└─────────┘      └─────────┘      └──────────┘
  HTTPS            SSL             HTTP
```

### Por que usar Nginx?

**Vantagens:**
- ✅ Alta performance (C++ nativo, event-driven)
- ✅ Baixo consumo de memória
- ✅ Load balancing automático
- ✅ Serve arquivos estáticos muito rápido
- ✅ SSL/TLS termination (HTTPS)
- ✅ Compressão gzip/brotli
- ✅ Cache HTTP
- ✅ Rate limiting
- ✅ Proteção contra DDoS

**Casos de uso:**
- Servir frontend React/Vue (arquivos estáticos)
- Reverse proxy para API Node.js/Python
- Load balancer entre múltiplas instâncias
- SSL termination (HTTPS)

---

### Instalação

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install nginx -y

# Verificar status
sudo systemctl status nginx

# Iniciar/parar/reiniciar
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx

# Habilitar no boot
sudo systemctl enable nginx
```

#### macOS
```bash
brew install nginx

# Iniciar
brew services start nginx
```

#### Windows
```bash
# Baixar de nginx.org/download
# Ou usar Docker (recomendado)
docker run -d -p 80:80 nginx:alpine
```

---

### Estrutura de Arquivos

```
/etc/nginx/
├── nginx.conf                  # Configuração principal
├── sites-available/            # Configurações disponíveis
│   └── fintrack               # Configuração do FinTrack
├── sites-enabled/              # Configurações ativas (symlinks)
│   └── fintrack -> ../sites-available/fintrack
├── conf.d/                     # Configurações extras
├── snippets/                   # Trechos reutilizáveis
│   └── ssl-params.conf
└── mime.types                  # Tipos MIME

/var/log/nginx/
├── access.log                  # Logs de acesso
└── error.log                   # Logs de erro

/var/www/html/                  # Diretório padrão de arquivos
```

---

### Configuração Básica - Servidor Web

#### Servir Frontend React (Arquivos Estáticos)

```nginx
# /etc/nginx/sites-available/fintrack-frontend
server {
    listen 80;
    listen [::]:80;
    server_name fintrack.com www.fintrack.com;

    # Diretório com build do React
    root /var/www/fintrack/frontend/dist;
    index index.html;

    # Compressão gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/xml+rss application/json;

    # Cache de arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA routing - todas as rotas vão para index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

---

### Reverse Proxy - Backend API

#### Proxy para Node.js Backend

```nginx
# /etc/nginx/sites-available/fintrack-backend
server {
    listen 80;
    listen [::]:80;
    server_name api.fintrack.com;

    # Logs
    access_log /var/log/nginx/fintrack-api-access.log;
    error_log /var/log/nginx/fintrack-api-error.log;

    # Proxy para backend Node.js
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;

        # Headers importantes
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:4000/health;
        access_log off;
    }

    # WebSocket support (se necessário)
    location /ws {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

### Configuração Completa - Frontend + Backend

```nginx
# /etc/nginx/sites-available/fintrack
server {
    listen 80;
    listen [::]:80;
    server_name fintrack.com www.fintrack.com;

    # Redirecionar para HTTPS (depois de configurar SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name fintrack.com www.fintrack.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/fintrack.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fintrack.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/fintrack.com/chain.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - Arquivos estáticos
    root /var/www/fintrack/frontend/dist;
    index index.html;

    # Compressão
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Cache de assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API - Proxy para backend
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS (se necessário)
        add_header Access-Control-Allow-Origin https://fintrack.com always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### Load Balancing (Múltiplas Instâncias)

```nginx
# Upstream - definir pool de servidores
upstream backend_servers {
    # Estratégias:
    # - round-robin (padrão): revezamento
    # - least_conn: menos conexões ativas
    # - ip_hash: mesmo IP vai para mesmo servidor

    least_conn;

    server localhost:4000 weight=3;  # 60% do tráfego
    server localhost:4001 weight=2;  # 40% do tráfego
    server localhost:4002 backup;    # Backup (só se outros falharem)

    # Health check
    server localhost:4003 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.fintrack.com;

    location / {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

### Rate Limiting (Proteção DDoS)

```nginx
# Definir zona de rate limit
http {
    # Limite: 10 requisições por segundo por IP
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    # Limite de conexões simultâneas
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
}

server {
    listen 80;
    server_name api.fintrack.com;

    location /api/ {
        # Aplicar rate limit
        limit_req zone=api_limit burst=20 nodelay;
        limit_conn conn_limit 10;

        proxy_pass http://localhost:4000;
    }

    # Endpoint de login mais restritivo
    location /api/auth/login {
        limit_req zone=api_limit burst=5 nodelay;
        proxy_pass http://localhost:4000;
    }
}
```

---

### Cache HTTP

```nginx
# Cache path
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m
                     max_size=1g inactive=60m use_temp_path=off;
}

server {
    listen 80;
    server_name api.fintrack.com;

    location /api/dashboard/stats {
        proxy_cache api_cache;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        proxy_cache_valid 200 5m;  # Cache por 5 minutos
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;

        proxy_pass http://localhost:4000;
    }
}
```

---

### SSL/TLS com Let's Encrypt

#### Instalar Certbot

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d fintrack.com -d www.fintrack.com -d api.fintrack.com

# Responder perguntas:
# Email: seu@email.com
# Aceitar termos: Yes
# Redirecionar HTTP → HTTPS: Yes

# Certificado instalado em:
# /etc/letsencrypt/live/fintrack.com/

# Renovação automática (já configurada)
sudo systemctl status certbot.timer

# Testar renovação
sudo certbot renew --dry-run
```

#### Configuração SSL Manual

```nginx
server {
    listen 443 ssl http2;
    server_name fintrack.com;

    # Certificados
    ssl_certificate /etc/letsencrypt/live/fintrack.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fintrack.com/privkey.pem;

    # Configuração SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

---

### Comandos Úteis

```bash
# Testar configuração (SEMPRE fazer antes de reiniciar)
sudo nginx -t

# Recarregar configuração (sem downtime)
sudo nginx -s reload
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs em tempo real
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver status
sudo systemctl status nginx

# Habilitar site
sudo ln -s /etc/nginx/sites-available/fintrack /etc/nginx/sites-enabled/

# Desabilitar site
sudo rm /etc/nginx/sites-enabled/fintrack

# Ver configuração ativa
sudo nginx -T

# Ver processos
ps aux | grep nginx
```

---

### Nginx com Docker

#### Dockerfile para Frontend

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Nginx stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf customizado

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compressão
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### docker-compose com Nginx

```yaml
version: '3.8'

services:
  # Frontend com Nginx
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fintrack-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  # Backend API
  backend:
    build: ./backend
    container_name: fintrack-backend
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production

  # Nginx como Reverse Proxy (alternativa)
  nginx-proxy:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - backend
```

---

### Monitoramento Nginx

#### Status Module

```nginx
# Habilitar status endpoint
server {
    listen 8080;
    server_name localhost;

    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
```

```bash
# Ver status
curl http://localhost:8080/nginx_status

# Resposta:
# Active connections: 291
# server accepts handled requests
#  16630948 16630948 31070465
# Reading: 6 Writing: 179 Waiting: 106
```

#### Logs Estruturados

```nginx
# Log format JSON
http {
    log_format json_combined escape=json
    '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"request":"$request",'
        '"status":$status,'
        '"body_bytes_sent":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"upstream_response_time":"$upstream_response_time",'
        '"http_user_agent":"$http_user_agent"'
    '}';

    access_log /var/log/nginx/access.log json_combined;
}
```

---

### Troubleshooting

#### Erro: "Permission denied"
```bash
# Verificar permissões
ls -la /var/www/fintrack

# Ajustar owner
sudo chown -R www-data:www-data /var/www/fintrack

# Ajustar permissões
sudo chmod -R 755 /var/www/fintrack
```

#### Erro: "502 Bad Gateway"
```bash
# Backend não está rodando
sudo systemctl status fintrack-backend

# Verificar porta
sudo netstat -tlnp | grep 4000

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

#### Erro: "Connection refused"
```bash
# Verificar se backend está escutando
curl http://localhost:4000/health

# Verificar proxy_pass no Nginx
sudo nginx -T | grep proxy_pass
```

#### Testar configuração
```bash
# Validar sintaxe
sudo nginx -t

# Ver configuração completa
sudo nginx -T

# Recarregar sem downtime
sudo nginx -s reload
```

---

### Best Practices

✅ **Sempre testar antes de recarregar**: `sudo nginx -t`
✅ **Usar HTTPS (Let's Encrypt)**: Certificado gratuito
✅ **Habilitar compressão gzip**: Reduz bandwidth
✅ **Cache de assets estáticos**: Melhora performance
✅ **Security headers**: Protege contra ataques
✅ **Rate limiting**: Previne abuso/DDoS
✅ **Logs estruturados**: Facilita análise
✅ **Health checks**: Monitoramento proativo
✅ **Buffer sizes adequados**: Previne erros 413
✅ **Timeouts configurados**: Evita requests travados

---

## CI/CD com GitHub Actions

### Setup Initial

```bash
# Criar workflows
mkdir -p .github/workflows
```

### Workflow - Tests

```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: fintrack
          POSTGRES_PASSWORD: test
          POSTGRES_DB: fintrack_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      # 1. Checkout código
      - uses: actions/checkout@v3

      # 2. Setup Node
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      # 3. Instalar dependências
      - run: npm ci

      # 4. Setup BD
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://fintrack:test@localhost:5432/fintrack_test

      # 5. Rodar testes
      - run: npm test -- --coverage

      # 6. Upload coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      # 7. Verificar linting
      - run: npm run lint
```

### Workflow - Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      # Build e push de imagem Docker
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/fintrack:latest

      # Deploy em Railway
      - name: Deploy to Railway
        run: |
          npm install -g railway
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Cloud Deployment

### Railway (Recomendado para Iniciantes)

```bash
# 1. Instalar Railway CLI
npm install -g railway

# 2. Fazer login
railway login

# 3. Criar projeto
railway init

# 4. Adicionar variáveis de ambiente
railway variables set JWT_SECRET "sua_chave"
railway variables set DATABASE_URL "postgresql://..."

# 5. Deploy
railway up

# 6. Ver logs
railway logs

# Ver URL pública
railway status
```

### Railway com Banco de Dados

```bash
# 1. Criar projeto no painel
# railway.app

# 2. Adicionar PostgreSQL via UI
# Add Service → PostgreSQL

# 3. CLI pega DATABASE_URL automaticamente
railway variables get DATABASE_URL

# 4. Deploy
git push  # Webhook automático após conectar GitHub
```

### Vercel (para Frontend)

```bash
npm install -g vercel

vercel login
vercel deploy

# Com ambiente
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel deploy --prod
```

### Neon (PostgreSQL Serverless)

```bash
# 1. Ir para https://console.neon.tech
# 2. Criar projeto
# 3. Copiar connection string
# DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require

# 4. Usar em Railway/Vercel
railway variables set DATABASE_URL "postgresql://..."
```

### Estrutura de Deploy - Resumo

```
┌─────────────────────────────────────┐
│  GitHub Repository                  │
│  (main branch push)                 │
└────────────────┬────────────────────┘
                 │
        ┌────────▼────────┐
        │  GitHub Actions │
        │  (Tests + Build)│
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   Docker Image  │
        │  (Buildx push)  │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   Railway       │
        │   (Deploy)      │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Neon Database  │
        │  (Migrations)   │
        └─────────────────┘
```

---

## Logging Estruturado

### Winston Setup

```bash
npm install winston
```

```javascript
// src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fintrack-api' },
  transports: [
    // ✅ Arquivo de erros
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // ✅ Arquivo combinado
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// ✅ Console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

module.exports = logger;

// src/middleware/logging.js
const logger = require('../config/logger');

// ✅ Middleware para logar requisições
function requestLogger(req, res, next) {
  logger.info('Requisição recebida', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id
  });

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Requisição concluída', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
}

module.exports = requestLogger;

// src/app.js
const app = require('express')();
const requestLogger = require('./middleware/logging');
const logger = require('./config/logger');

app.use(requestLogger);

// ✅ Usar logger em routes
app.post('/api/login', async (req, res, next) => {
  try {
    logger.info('Tentativa de login', { email: req.body.email });

    const usuario = await autenticar(req.body.email, req.body.senha);

    logger.info('Login bem-sucedido', { userId: usuario.id });
    res.json({ token: gerarToken(usuario.id) });
  } catch (erro) {
    logger.error('Erro no login', {
      email: req.body.email,
      error: erro.message,
      stack: erro.stack
    });
    next(erro);
  }
});

// ✅ Usar logger em services
class TransacaoService {
  async criar(dados) {
    logger.debug('Criando transação', dados);

    try {
      const transacao = await this.repository.criar(dados);
      logger.info('Transação criada', { transacaoId: transacao.id });
      return transacao;
    } catch (erro) {
      logger.error('Erro ao criar transação', {
        dados,
        error: erro.message
      });
      throw erro;
    }
  }
}
```

### Estrutura de Logs

```json
{
  "level": "error",
  "message": "Erro ao criar transação",
  "timestamp": "2025-02-19T14:30:00.000Z",
  "service": "fintrack-api",
  "userId": 42,
  "dados": {
    "contaId": 1,
    "valor": 100
  },
  "error": "Saldo insuficiente",
  "stack": "Error: Saldo insuficiente\n    at ..."
}
```

---

## Monitoramento com Sentry

### Setup

```bash
npm install @sentry/node @sentry/tracing
```

```javascript
// src/config/sentry.js
const Sentry = require('@sentry/node');
const { CaptureConsole } = require('@sentry/integrations');

function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new CaptureConsole({
        levels: ['error']
      })
    ]
  });

  // Middleware antes de rotas
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  return Sentry;
}

module.exports = { initSentry };

// src/app.js
const express = require('express');
const { initSentry } = require('./config/sentry');
const logger = require('./config/logger');

const app = express();

// ✅ Inicializar Sentry ANTES de rotas
initSentry(app);

app.use(express.json());

// ✅ Suas rotas
app.post('/api/login', async (req, res, next) => {
  try {
    // ...
  } catch (erro) {
    logger.error('Erro no login', { erro: erro.message });
    // ✅ Enviar para Sentry
    Sentry.captureException(erro);
    next(erro);
  }
});

// ✅ Middleware de erro Sentry (por último)
app.use(Sentry.Handlers.errorHandler());

app.listen(3000);

// ✅ Capturar erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason });
  Sentry.captureException(reason);
});
```

### Dashboard Sentry

```
sentry.io
├── Projetos
│   └── fintrack-api
│       ├── Issues (Erros agrupados)
│       │   ├── "Error: Saldo insuficiente"
│       │   │   ├── Ocorrências: 142
│       │   │   ├── Usuários afetados: 8
│       │   │   └── Stack trace
│       │   └── "ReferenceError: xxx is not defined"
│       ├── Releases
│       ├── Performance
│       └── Alerts
```

---

## Checklist de Conhecimentos

### Fundamentos de Redes
- [ ] Conceitos de IP (IPv4/IPv6, público/privado)
- [ ] Portas e serviços (80, 443, 22, 5432, etc)
- [ ] Firewall (ufw, iptables)
- [ ] TCP vs UDP
- [ ] NAT (Network Address Translation)
- [ ] Load Balancer
- [ ] Proxy vs Reverse Proxy
- [ ] CDN (Content Delivery Network)
- [ ] Latência vs Bandwidth
- [ ] Testes de rede (ping, traceroute, netstat, nmap)
- [ ] Fail2Ban e proteção brute force
- [ ] VPC e subnets
- [ ] Conectividade Backend ↔ Database
- [ ] Checklist de segurança de rede

### SSH (Secure Shell)
- [ ] O que é SSH e para que serve
- [ ] Autenticação: senha vs chave SSH
- [ ] Como funciona criptografia assimétrica (pública/privada)
- [ ] Gerar chaves SSH (ssh-keygen)
- [ ] Adicionar chave pública ao servidor (authorized_keys)
- [ ] Conectar via SSH (ssh user@host)
- [ ] SSH config file (~/.ssh/config)
- [ ] Transferir arquivos (SCP, SFTP, rsync)
- [ ] Port forwarding (local, remote, dynamic)
- [ ] SSH no GitHub (git clone via SSH)
- [ ] Hardening SSH (sshd_config)
- [ ] SSH Agent (gerenciar chaves)
- [ ] Troubleshooting SSH (debug, permissões)
- [ ] SSH no CI/CD (GitHub Actions)
- [ ] Best practices de segurança SSH

### Docker
- [ ] Dockerfile e imagens
- [ ] Multi-stage builds
- [ ] docker-compose - orquestração local
- [ ] .dockerignore
- [ ] Docker commands (build, run, exec, logs)
- [ ] Docker networks
- [ ] Docker volumes

### Nginx
- [ ] Conceitos: Servidor Web vs Reverse Proxy
- [ ] Configuração básica de servidor
- [ ] Servir arquivos estáticos (Frontend)
- [ ] Reverse proxy para backend API
- [ ] Load balancing entre múltiplas instâncias
- [ ] SSL/TLS com Let's Encrypt
- [ ] Rate limiting e proteção DDoS
- [ ] Cache HTTP
- [ ] Security headers
- [ ] Logs e monitoramento
- [ ] Nginx com Docker

### CI/CD
- [ ] GitHub Actions workflows
- [ ] CI/CD pipeline
- [ ] Testes automatizados no pipeline
- [ ] Deploy automático
- [ ] Docker image build e push
- [ ] Secrets management

### Cloud & Deployment
- [ ] Railway deployment
- [ ] Render deployment
- [ ] VPS (DigitalOcean, Hetzner, Linode)
- [ ] PostgreSQL em Neon
- [ ] Variáveis de ambiente seguras
- [ ] Health checks
- [ ] Zero-downtime deploys
- [ ] Backup e recuperação

### Observabilidade
- [ ] Winston logging
- [ ] Structured logging
- [ ] Sentry error tracking
- [ ] Monitoring e alertas
- [ ] Log aggregation
- [ ] Uptime monitoring (UptimeRobot)
- [ ] APM (Application Performance Monitoring)

---

## Próximo Módulo

Agora que sua aplicação está em produção e monitorada, explore **Módulo 10: Documentação** para facilitar manutenção e onboarding.
