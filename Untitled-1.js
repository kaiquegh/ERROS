/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ImageBackground,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Icon} from 'native-base';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import ico_incrementacao from '../../assets/ico_incrementacao.png';
import ico_bugfix from '../../assets/ico_bugfix.png';
import ico_tarefa from '../../assets/ico_tarefa.png';
import {useNavigation, useRoute} from '@react-navigation/native';
import HeaderSearch from '../../components/HeaderSearch/HeaderSearch';
import Header from '../../components/Header/Header';
import api from '../../api/api';
import styles from './styles';

function Item({item}) {
  const navigation = useNavigation();
  var dataAtual = new Date();

  //Função para formatar a Data
  const FormatandoDatas = () => {
    if (item.dueDate != null) {
      const arrayData = item.dueDate.split('/');
      const dataAtualizada =
        arrayData[2] + '/' + arrayData[1] + '/' + arrayData[0];
      return dataAtualizada;
    }
  };

  return (
    <TouchableOpacity onPress={() => navigation.navigate('TarefasInfo', item)}>
      <View style={styles.cardCarousel}>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View style={{flex: 1}}>
            <Text style={styles.estiloTextoTitulo}>{item.code}</Text>
          </View>

          <View style={{alignItems: 'flex-end'}}>
            <Image
              style={{marginRight: 10, marginTop: 10}}
              source={
                item.type === 'Incrementação'
                  ? ico_incrementacao
                  : item.type === 'Bugfix'
                  ? ico_bugfix
                  : item.type === 'Tarefa' || 'task'
                  ? ico_tarefa
                  : null
              }
            />
            {item.dueDate && new Date(item.dueDate) < dataAtual ? (
              <Text style={{color: 'red', marginRight: 10, marginTop: 10}}>
                {FormatandoDatas()}
              </Text>
            ) : (
              <Text style={{marginRight: 10, marginTop: 10}}>
                {FormatandoDatas()}
              </Text>
            )}
          </View>
        </View>

        <Text numberOfLines={1} style={styles.estiloTextoDescricao}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const Carousel1 = ({navigation}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [dadosTarefa, setDadosTarefa] = useState();
  const [estaPesquisando, setEstaPesquisando] = useState(false);
  const [filtroSearch, setFiltroSearch] = useState('');
  const {params: tarefas} = useRoute();

  const [dadosFiltrado, setDadosFiltrado] = useState('');

  //Chamando Api
  useEffect(() => {
    (async function listarTarefas() {
      api
        .get('/tarefas/' + tarefas.id)
        .then(function(response) {
          const grupos = response.data.reduce((prev, tarefa) => {
            return Object.assign(prev, {
              [tarefa.status]: (prev[tarefa.status] || []).concat(tarefa),
            });
          }, {});

          const grupoDasTarefas = Object.entries(grupos);

          // console.log('Imprimindo grupo ', grupoDasTarefas);
          const tarefasGrupoArray = grupoDasTarefas.map(arrayTarefas => {
            const titulo = arrayTarefas[0]; // grupo
            const valor = arrayTarefas[1]; // tarefas
            const qtTarefa = valor.length; //Quantidade Tarefas
            return {titulo: titulo, tarefas: valor, qtTarefa: qtTarefa};
          });
          // console.log('Tarefas ', tarefasGrupoArray);
          // setDadosTarefa(tarefasGrupoArray);
          setDadosFiltrado(tarefasGrupoArray);
        })
        .catch(function(error) {
          console.log(error);
        });
    })();
  }, [tarefas.id]);

  //Pesquisando tarefas
  useEffect(() => {
    navigation.setOptions({
      header:
        estaPesquisando === true
          ? propriedade => (
              <HeaderSearch
                {...propriedade}
                onChangeTextSearch={setFiltroSearch}
                estaPesquisando={estaPesquisando}
                setEstaPesquisando={setEstaPesquisando}
              />
            )
          : Header,

      headerRight: () => (
        <TouchableOpacity onPress={() => setEstaPesquisando(true)}>
          <Icon name="search" size={26} style={{color: 'white'}} />
        </TouchableOpacity>
      ),
    });
  }, [estaPesquisando, navigation]);

  useEffect(() => {
    if (!dadosTarefa) {
      return;
    }
    console.log('Dados Tarefas ', dadosTarefa[0].tarefas);
    const dadosFiltrado = dadosTarefa[0].tarefas.filter(item => {
      if (
        item.code.toUpperCase().includes(filtroSearch.toUpperCase()) === false
      ) {
        return false;
      }
      return true;
    });

    setDadosFiltrado(dadosFiltrado);
  }, [dadosTarefa, filtroSearch]);

  navigation.setOptions({
    title: tarefas.title,
  });
  //Colocando tipo do projeto no header da tela

  const _renderItem = ({item, index}) => {
    // console.log('Item: ', item);
    return (
      <FlatList
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            <View style={styles.titleView}>
              <Text style={styles.titleText}>{item.titulo}</Text>
              <Text style={styles.qtItens}>({item.qtTarefa})</Text>
            </View>
            <View
              style={{
                marginLeft: 20,
                width: '90%',
                marginBottom: 25,
                borderBottomWidth: StyleSheet.hairlineWidth,
                backgroundColor: 'white',
              }}
            />
          </>
        }
        keyExtractor={(item, index) => index.toString()}
        data={item.tarefas}
        renderItem={({item}) => <Item item={item} />}
      />
    );
  };

  const {width} = Dimensions.get('window');
  console.log('DadosFiltado: ', dadosFiltrado);
  return (
    <ImageBackground
      source={require('../../assets/bg_kanban.png')}
      style={{flex: 1}}>
      <Carousel
        data={dadosFiltrado}
        renderItem={_renderItem}
        lockScrollWhileSnapping={true}
        lockScrollTimeoutDuration={200}
        onSnapToItem={index => setActiveSlide(index)}
        sliderWidth={width}
        itemWidth={width}
        containerCustomStyle={{
          marginBottom: 50,
        }}
      />

      <Pagination
        dotsLength={dadosFiltrado.length}
        activeDotIndex={activeSlide}
        dotStyle={styles.dotStyle}
        inactiveDotStyle={styles.inactiveDotStyle}
        inactiveDotOpacity={1}
        inactiveDotScale={0.6}
      />
    </ImageBackground>
  );
};

export default Carousel1;
