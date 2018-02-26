<?php
    /*
        数据库操作类
    */ 
    class DB
    {
        private $tableName;    // 表名称
        static private $pdo;   // 保存单例pdo对象
        private $orderBy = ''; // 排序子句     
        private $limit = '';   // 分页子句
        private $where = [];   // 存放条件的数组
        private $fields = [];  // 表中的所有字段,除了主键
        private $pk = '';      // 主键字段
        
        /*
            构造方法
            功能: 确定要操作的表对象
            参数: $bm  要操作的数据表名称
            返回: 无
        */
        public function __construct($bm)
        {
            $this -> tableName = $bm;
            self::getPdo();
            $this->getFields(); // 获取数据表的所有字段名称
        }

        
        /*
          功能: 获取表中所有字段
        */
        private function getFields()
        {
            $sql = 'DESC '.$this->tableName;
            $stmt = self::$pdo -> query($sql);
            $fields = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach($fields as $k=>$v){
                if ($v['Key'] === 'PRI') {
                    $this -> pk = $v['Field'];
                    continue;
                }
                $this->fields[] = $v['Field'];
            }
        }
        
        /*
          功能: 获取单例PDO对象
          参数: 无
          返回: 一个pdo对象
        */
        static public function getPdo()
        {
            if (empty(self::$pdo)) {
                self::$pdo = new PDO(DSN, USER, UPWD);
            }
            return self::$pdo;
        }
        
        /*
          功能: 插入记录
          参数: $data 数组形式的数据
          返回: 受影响行数
        */
        public function insert($data)
        {
            $fields = '';
            $values = '';
            foreach($data as $k=>$v){
                $fields .= "$k,";
                $values .= "'$v',";
            }
            $fields = rtrim($fields, ',');
            $values = rtrim($values, ',');
            
            $sql = 'INSERT INTO '.$this->tableName.'('.$fields.') VALUES('.$values.')';
            
            return self::$pdo -> exec($sql);
        }
        
        /*
           功能: 删除一条记录
           参数: 无
           返回: 受影响行数
        */
        public function delete()
        {
            $sql = 'DELETE FROM '.$this->tableName.$this->getWhere();
            $this -> clearWhere();
            return self::$pdo -> exec($sql);
        }
        
        /*
           功能: 更新一条记录数据
           参数: $data 要更新的数据
           返回: 受影响行数
        */
        public function update($data)
        {
            $sql = 'UPDATE '.$this->tableName.' SET ';
            foreach($data as $k=>$v){
                $sql .= $k.'=\''.$v.'\',';
            }
            $sql = rtrim($sql, ',').$this->getWhere();
            
            $this -> clearWhere();
            
            return self::$pdo -> exec($sql);
            
        }
        
        /*
           功能: 查询多条记录
           参数: 无
           返回: 成功返回二维数组, 失败返回空数组
        */
        public function select()
        {
            $sql = 'SELECT * FROM '.$this->tableName.$this->getWhere().$this->orderBy.$this->limit;
            
            // 清除所有查询条件
            $this->clearWhere();
            
            // 发送执行
            $stmt = self::$pdo -> query($sql);
            
            return $stmt -> fetchAll(PDO::FETCH_CLASS);
            
        }
        
        /*
           功能: 把一个查询条件存储到数组
           参数: $con 条件字符串
           返回: 对象自己
        */
        public function where($con)
        {
            $this->where[] = $con;
            return $this;
        }
        
        
        /*
           功能: 生成 where 子句
           参数: 无
           返回: 条件字符串,无条件则返回一个空字符串
        */
        private function getWhere()
        {
            if (empty($this->where)) {
                return '';
            }
            return ' WHERE '.implode(' AND ', $this->where);
        }
        
        /*
           功能: 清除所有查询条件
           参数: 无
           返回: 无
        */
        private function clearWhere()
        {
            $this -> where   = [];
            $this -> orderBy = '';
            $this -> limit   = '';
        }
        
        /*
           功能: 统计符合条件的记录条数
           参数: 无
           返回: 记录数
        */
        public function rowCount()
        {
            $sql = 'SELECT  COUNT(*) AS cnt FROM '.$this->tableName.$this->getWhere();
            $stmt = self::$pdo -> query($sql);
            return $stmt->fetch(PDO::FETCH_OBJ)->cnt;
        }
        
        /*
           功能: 获取单条记录
           参数: 无 (用where方法设置条件)
           返回: 单条记录
        */
        public function find()
        {
            $sql = 'SELECT * FROM '.$this->tableName.$this->getWhere().' LIMIT 1 ';
            $stmt = self::$pdo->query($sql);
            return $stmt -> fetch(PDO::FETCH_OBJ);
        }
        
    
        /*
           功能: 保存设置排序子句
           参数: 排序子句
           返回: 无
        */
        public function orderBy($con)
        {
            $this -> orderBy = ' ORDER BY '.$con;
            return $this;
        }
        
        /*
           功能: 保存设置分页子句
           参数: 分页子句
           返回: 无
        */
        public function limit($con)
        {
            $this -> limit = ' LIMIT '.$con;
            return $this;
        }
    
    }